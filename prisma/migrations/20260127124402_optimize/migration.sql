-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "isStreaming" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "chat_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
