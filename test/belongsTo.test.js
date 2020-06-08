"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const porm_1 = require("../src/porm");
const db_1 = __importDefault(require("./db"));
const Message = porm_1.model(db_1.default, 'messages', {
    relations: {
        chat: {
            belongsTo: () => Chat
        },
        chatWithScope: {
            belongsTo: () => Chat,
            scope: (chats) => chats.active()
        }
    }
});
const Chat = porm_1.model(db_1.default, 'chats', {
    scopes: {
        active: (chats) => chats.where({ active: true })
    }
});
const User = porm_1.model(db_1.default, 'user_table_name');
// describe('belongsTo', () => {
//   it('makes proper query', () => {
//     const message = {chat_id: 5}
//     expect(db.messages.chat(message).toSql()).toBe(line(`
//       SELECT "chats".* FROM "chats"
//       WHERE "chats"."id" = ${message.chat_id}
//       LIMIT 1
//     `))
//     expect(db.messages.chatWithScope(message).toSql()).toBe(line(`
//       SELECT "chats".* FROM "chats"
//       WHERE "chats"."active" = true
//         AND "chats"."id" = ${message.chat_id}
//       LIMIT 1
//     `))
//   })
//
//   it('can be joined', () => {
//     const q = db.messages.all()
//     expect(q.join('chat').toSql()).toBe(line(`
//       SELECT "messages".* FROM "messages"
//       JOIN "chats"
//         ON "chats"."id" = "messages"."chat_id"
//     `))
//     expect(q.join('chatWithScope').toSql()).toBe(line(`
//       SELECT "messages".* FROM "messages"
//       JOIN "chats"
//         ON "chats"."active" = true
//        AND "chats"."id" = "messages"."chat_id"
//     `))
//   })
//
//   it('has json subquery', () => {
//     expect(db.messages.chat.json().toSql()).toBe(line(`
//       SELECT COALESCE(row_to_json("t".*), '{}') AS json
//       FROM (
//         SELECT "chats".* FROM "chats"
//         WHERE "chats"."id" = "messages"."chat_id"
//         LIMIT 1
//       ) "t"
//     `))
//     expect(db.messages.chatWithScope.json().toSql()).toBe(line(`
//       SELECT COALESCE(row_to_json("t".*), '{}') AS json
//       FROM (
//         SELECT "chats".* FROM "chats"
//         WHERE "chats"."active" = true
//           AND "chats"."id" = "messages"."chat_id"
//         LIMIT 1
//       ) "t"
//     `))
//   })
// })
//
// describe('belongsTo polymorphic', () => {
//   it('makes proper query', () => {
//     const image = {object_id: 1, object_type: 'users_table_name'}
//     expect(db.images.object(image).toSql()).toBe(line(`
//       SELECT "users_table_name".* FROM "users_table_name"
//       WHERE "users_table_name"."id" = 1
//       LIMIT 1
//     `))
//   })
// })
