import json
import os
import psycopg2
import psycopg2.extras

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Voter-Id",
}

VALID_DAYS = {"fri", "sat", "sun", "thu"}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"], sslmode="disable")


def handler(event: dict, context) -> dict:
    """Голосование за день первой тусовки ВАЙБ. GET — результаты, POST — проголосовать."""

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT day, COUNT(*) FROM vibe_votes GROUP BY day")
        rows = cur.fetchall()
        conn.close()
        votes = {"fri": 0, "sat": 0, "sun": 0, "thu": 0}
        for day, count in rows:
            votes[day] = int(count)
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"votes": votes}),
        }

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        day = body.get("day")
        voter_id = body.get("voter_id")

        if not day or day not in VALID_DAYS:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "invalid day"})}
        if not voter_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "voter_id required"})}

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT day FROM vibe_votes WHERE voter_id = %s", (voter_id,))
        existing = cur.fetchone()

        if existing:
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"already_voted": True, "day": existing[0]})}

        cur.execute("INSERT INTO vibe_votes (day, voter_id) VALUES (%s, %s)", (day, voter_id))
        conn.commit()

        cur.execute("SELECT day, COUNT(*) FROM vibe_votes GROUP BY day")
        rows = cur.fetchall()
        conn.close()

        votes = {"fri": 0, "sat": 0, "sun": 0, "thu": 0}
        for d, count in rows:
            votes[d] = int(count)

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"success": True, "votes": votes}),
        }

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
