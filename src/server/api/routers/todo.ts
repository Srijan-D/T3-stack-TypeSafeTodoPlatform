import { z } from "zod";
import { todoInput } from "~/types";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
    //only protected session as we need the user to be logged in
    all: protectedProcedure.query(async ({ ctx }) => {
        //ct constains user session prisma client
        const todos = await ctx.prisma.todo.findMany({
            where: {
                userId: ctx.session.user.id,
            },
            //return only the fields we need
        })
        console.log('todos from prisma==>', todos.map(({ id, text, done }) => ({ id, text, done })))
        //fake data for the time being
        return [
            {
                id: 1,
                title: "First todo",
                done: false,
            },
            {
                id: 2,
                title: "Second todo",
                done: true,

            }
        ]
    }),
    create: protectedProcedure.input(todoInput).mutation(async ({ ctx, input }) => {
        return ctx.prisma.todo.create({
            data: {
                text: input,
                user: {
                    connect: {
                        id: ctx.session.user.id
                        //we need to connect the todo to the user
                    }
                }

            }
        })
    }),
    delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.prisma.todo.delete({
            where: {
                id: input
            },
        })
    }),
    toggle: protectedProcedure.input(z.object({
        id: z.string(),
        done: z.boolean()
    })).mutation(async ({ ctx, input: { id, done } }) => {
        return ctx.prisma.todo.update({
            data: {
                done,
            },
            where: {
                id,
            }

        })
    }),


});