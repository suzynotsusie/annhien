import { mapVideo } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import type { DbUser, DbVideo } from '../types/domain';
import type { CreateVideoBody, ListVideosQuery } from '../validations/videos.validation';

/**
 * @param query Validated video list query.
 * @returns Approved videos in API shape.
 */
export async function listApprovedVideos(query: ListVideosQuery) {
  const limit = query.limit ?? 10;
  const offset = query.offset ?? 0;

  if (isSupabaseConfigured) {
    let statement = supabase
      .from('videos')
      .select('id,doctor_id,title,topic,video_url,description,status,likes,saved,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.topic) {
      statement = statement.eq('topic', query.topic);
    }

    const { data, error } = await statement;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const videos = (data ?? []) as DbVideo[];
    const doctorNameById = await buildSupabaseDoctorNameMap(videos);
    return {
      videos: videos.map((video) => mapVideo(video, video.doctor_id ? doctorNameById.get(video.doctor_id) ?? null : null)),
    };
  }

  const doctorNameById = new Map(localStore.users.map((user) => [user.id, user.nickname]));
  const videos = localStore.videos
    .filter((video) => video.status === 'approved' && (!query.topic || video.topic === query.topic))
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(offset, offset + limit);

  return {
    videos: videos.map((video) => mapVideo(video, video.doctor_id ? doctorNameById.get(video.doctor_id) ?? null : null)),
  };
}

/**
 * @param doctorId Authenticated doctor id.
 * @param input Validated video creation payload.
 * @returns Minimal created video payload.
 */
export async function createVideo(doctorId: string, input: CreateVideoBody) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        doctor_id: doctorId,
        title: input.title,
        topic: input.topic,
        video_url: input.videoUrl,
        description: input.description || null,
        status: 'pending',
      })
      .select('id,status,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao video', 'SUPABASE_INSERT_FAILED');
    }

    return data;
  }

  const video: DbVideo = {
    id: createLocalId('video'),
    doctor_id: doctorId,
    title: input.title,
    topic: input.topic,
    video_url: input.videoUrl,
    description: input.description || null,
    status: 'pending',
    likes: 0,
    saved: 0,
    created_at: createTimestamp(),
  };
  localStore.videos.push(video);

  return {
    id: video.id,
    status: video.status,
    createdAt: video.created_at,
  };
}

/**
 * @param videos Videos that need doctor display names.
 * @returns Lookup map of doctor id to nickname.
 */
async function buildSupabaseDoctorNameMap(videos: DbVideo[]): Promise<Map<string, string>> {
  const doctorIds = [...new Set(videos.map((video) => video.doctor_id).filter((id): id is string => Boolean(id)))];
  const doctorNameById = new Map<string, string>();

  if (doctorIds.length === 0) {
    return doctorNameById;
  }

  const { data, error } = await supabase.from('users').select('id,nickname').in('id', doctorIds);
  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  for (const doctor of (data ?? []) as Pick<DbUser, 'id' | 'nickname'>[]) {
    doctorNameById.set(doctor.id, doctor.nickname);
  }

  return doctorNameById;
}
