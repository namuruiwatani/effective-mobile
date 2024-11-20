import { Router, Request, Response, NextFunction } from "express";
import { pool } from "../db";

const router = Router();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { action_type, product_id, shop_id, plu, details } = req.body;

    if (!action_type) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    try {
      await pool.query(
        `INSERT INTO actions_log (action_type, product_id, shop_id, plu, details) VALUES ($1, $2, $3, $4, $5)`,
        [action_type, product_id, shop_id, plu, details]
      );
      res.status(201).json({ message: "Action logged successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to log action" });
    }
  })
);

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const shop_id = req.query.shop_id as string;
    const plu = req.query.plu as string;
    const action_type = req.query.action_type as string;
    const date_from = req.query.date_from as string;
    const date_to = req.query.date_to as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const offset = (page - 1) * limit;
    const filters: string[] = [];
    const params: (string | number)[] = [];

    if (shop_id) {
      filters.push(`shop_id = $${params.length + 1}`);
      params.push(Number(shop_id));
    }
    if (plu) {
      filters.push(`plu = $${params.length + 1}`);
      params.push(plu);
    }
    if (action_type) {
      filters.push(`action_type = $${params.length + 1}`);
      params.push(action_type);
    }
    if (date_from && date_to) {
      filters.push(
        `timestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`
      );
      params.push(date_from, date_to);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    try {
      const result = await pool.query(
        `SELECT * FROM actions_log ${whereClause} ORDER BY timestamp DESC LIMIT $${
          params.length + 1
        } OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch actions" });
    }
  })
);

export default router;
