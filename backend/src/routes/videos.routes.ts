import { Router } from 'express';
import { ApiError, asyncRoute, parsePagination, sendError } from '../lib/http';
import { mapVideo } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { asTopic } from '../lib/validation';
import type { DbUser, DbVideo } from '../types/domain';

const router = Router();

router.get(
  '/',
  asyncRoute(async (req, res) => {
    const { limit, offset } = parsePagination(req.query, { limit: 10, offset: 0 });
    const topic = req.query.topic ? asTopic(req.query.topic) : null;

    if (req.query.topic && !topic) {
      return sendError(res, 400, 'Topic khong hop le', 'INVALID_TOPIC');
    }

    let query = supabase
      .from('videos')
      .select('id,doctor_id,title,topic,video_url,description,status,likes,saved,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) {
      query = query.eq('topic', topic);
    }

    const { data, error } = await query;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const videos = (data ?? []) as DbVideo[];
    const doctorIds = [...new Set(videos.map((video) => video.doctor_id).filter((id): id is string => Boolean(id)))];
    const doctorNameById = new Map<string, string>();

    if (doctorIds.length > 0) {
      const { data: doctors, error: doctorError } = await supabase
        .from('users')
        .select('id,nickname')
        .in('id', doctorIds);

      if (doctorError) {
        throw new ApiError(500, doctorError.message, 'SUPABASE_SELECT_FAILED');
      }

      for (const doctor of (doctors ?? []) as Pick<DbUser, 'id' | 'nickname'>[]) {
        doctorNameById.set(doctor.id, doctor.nickname);
      }
    }

    return res.status(200).json({
      videos: videos.map((video) => mapVideo(video, video.doctor_id ? doctorNameById.get(video.doctor_id) ?? null : null)),
    });
  })
);

export default router;
