import { z } from "zod";
import { OPPORTUNITY_STATUSES } from "@/lib/constants";

export const opportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);
