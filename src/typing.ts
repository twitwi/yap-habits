
import { z } from 'zod'

export const zPerson = z.string()
export type Person = z.infer<typeof zPerson>

export const zDate = z.string()
export type Date = z.infer<typeof zDate>

export const zTime = z.number().int()
export type Time = z.infer<typeof zTime>

export const zActivity = z.string()
export type Activity = z.infer<typeof zActivity>

export const zLog = z.object({
  at: zTime,
  activity: zActivity,
  quantity: z.number(),
})

export const zData = z.object({
  count: z.number(),
  logs: z.record(zPerson, z.record(zDate, zLog.array())),
})
export type Data = z.infer<typeof zData>

