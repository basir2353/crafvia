-- Fix Role column type when the first migration used TEXT instead of Role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
  END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'role'
      AND udt_name <> 'Role'
  ) THEN
    ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role");
  END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
