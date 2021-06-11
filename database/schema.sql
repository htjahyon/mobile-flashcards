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
CREATE TABLE "folderCards" (
    "folderCardId"  serial NOT NULL,
    "folderId"      integer NOT NULL,
    "cardsTitle"     text NOT NULL,
    CONSTRAINT "folderCards_pk" PRIMARY KEY ("folderCardId")
) WITH (
  OIDS=FALSE
);
CREATE TABLE "cards" (
    "cardId"    serial NOT NULL,
    "folderCardId"  integer NOT NULL,
    "question"  text NOT NULL,
    "answer"    text NOT NULL,
    CONSTRAINT "cards_pk" PRIMARY KEY ("cardId")
) WITH (
  OIDS=FALSE
);
ALTER TABLE "folders" ADD CONSTRAINT "folders_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "folderCards" ADD CONSTRAINT "folderCards_fk0" FOREIGN KEY ("folderId") REFERENCES "folders"("folderId");
ALTER TABLE "cards" ADD CONSTRAINT "cards_fk0" FOREIGN KEY ("cardId") REFERENCES "cards"("cardId");
