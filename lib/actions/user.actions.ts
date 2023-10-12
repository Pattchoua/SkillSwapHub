"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";


// Asynchronous function to fetch a user by their clerkId.
export async function getUserById(params: any) {
    try {
        connectToDatabase();

        const {userId} = params;
        const user = await User.findOne({ clerkId: userId});
        return user;

    } catch (error) {
        console.log(error);
        throw error

    }
}