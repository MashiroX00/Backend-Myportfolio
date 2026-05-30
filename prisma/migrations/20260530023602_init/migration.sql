-- CreateTable
CREATE TABLE "about" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "titles" JSONB NOT NULL DEFAULT '[]',
    "bio" TEXT NOT NULL DEFAULT '',
    "photo_url" TEXT,

    CONSTRAINT "about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tech_stack" JSONB NOT NULL DEFAULT '[]',
    "url" TEXT,
    "image_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" SERIAL NOT NULL,
    "cert_name" TEXT NOT NULL,
    "cert_description" TEXT,
    "issuer" TEXT NOT NULL,
    "date_issued" DATE NOT NULL,
    "url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_platform_key" ON "contact"("platform");
