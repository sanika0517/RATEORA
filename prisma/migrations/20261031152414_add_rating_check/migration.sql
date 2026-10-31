-- This is an empty migration.
ALTER TABLE "Rating"
ADD CONSTRAINT "Rating_rating_check"
CHECK ("rating" >= 1 AND "rating" <= 5);