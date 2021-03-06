set client_min_messages to warning;
drop schema "public" cascade;
create schema "public";
CREATE TABLE "users" (
    "userId"          serial NOT NULL,
    "username"        text NOT NULL,
    "hashedPassword"  text NOT NULL,
    "email"           text NOT NULL UNIQUE,
    CONSTRAINT "users_pk" PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "folders" (
    "folderId"    serial NOT NULL,
    "folderName"  text NOT NULL,
    "userId"      integer NOT NULL,
    CONSTRAINT "folders_pk" PRIMARY KEY ("folderId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "batches" (
    "batchId"  serial NOT NULL,
    "userId"  integer NOT NULL,
    "folderId"  integer NOT NULL,
    "batchName"  text NOT NULL,
    CONSTRAINT "batches_pk" PRIMARY KEY ("batchId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "cards" (
    "cardId"    serial NOT NULL,
    "batchId"  integer NOT NULL,
    "question"  text NOT NULL,
    "answer"    text NOT NULL,
    CONSTRAINT "cards_pk" PRIMARY KEY ("cardId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "scores" (
  "scoreId"  serial NOT NULL,
  "userId" integer NOT NULL,
  "folderName" text NOT NULL,
  "batchName" text NOT NULL,
  "correct" integer NOT NULL,
  "total" integer NOT NULL,
  CONSTRAINT "scores_pk" PRIMARY KEY ("scoreId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "share" (
  "shareId" serial NOT NULL,
  "sendUserId" integer NOT NULL,
  "receiveUserId" integer NOT NULL,
  "batchId" integer NOT NULL,
  "batchName" text NOT NULL,
  CONSTRAINT "share_pk" PRIMARY KEY ("shareId")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "folders" ADD CONSTRAINT "folders_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "batches" ADD CONSTRAINT "batches_fk0" FOREIGN KEY ("folderId") REFERENCES "folders"("folderId");
ALTER TABLE "cards" ADD CONSTRAINT "cards_fk0" FOREIGN KEY ("cardId") REFERENCES "cards"("cardId");
ALTER TABLE "scores" ADD CONSTRAINT "scores_fk0" FOREIGN KEY ("scoreId") REFERENCES "scores"("scoreId");
ALTER TABLE "share" ADD CONSTRAINT "share_fk0" FOREIGN KEY ("shareId") REFERENCES "share"("shareId");
