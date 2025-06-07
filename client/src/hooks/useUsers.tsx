import {useDatabase} from "../context/DatabaseContext.tsx";
import {useEffect, useState} from "react";
import type {User} from "@shared/schema";
import {apiClient} from "../lib/api";

type UserUpdate = Partial<User>;

const ERR_USERS_LOAD = 'Failed to load users';
const ERR_USER_LOAD = 'Failed to load user';
const ERR_USER_UPDATE = 'Failed to update user';
const ERR_USER_DELETE = 'Failed to delete user';

const db_getUsers = async () => {
    return await apiClient.getUsers() as User[];
}

const db_getUserById = async (id: string) => {
    return await apiClient.getUser(id) as User;
}

const db_updateUser = async (id: string, updates: UserUpdate) => {
    return await apiClient.updateUser(id, updates) as User;
}

const db_deleteUser = async (id: string) => {
    // Note: Delete user functionality not implemented in API yet
    throw new Error('Delete user functionality not implemented');
}

function useUsers() {
    const {dbOperation} = useDatabase();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getUserById = async (id: string): Promise<User | null> => {
        const existingUser = users.find(user => user.id === id);
        if (existingUser) return existingUser;

        return await dbOperation<User>(
            () => db_getUserById(id),
            (user) => setUsers(prevUsers => [...prevUsers, user]),
            setError,
            ERR_USER_LOAD
        )
    }

    const updateUser = async (id: string, updates: UserUpdate): Promise<User | null> => {
        return await dbOperation<User>(
            () => db_updateUser(id, updates),
            (user) => setUsers(prevUsers => prevUsers.map(prevUser => prevUser.id === id ? user : prevUser)),
            setError,
            ERR_USER_UPDATE
        )
    }

    const deleteUser = async (id: string): Promise<void | null> => {
        return await dbOperation<void>(
            () => db_deleteUser(id),
            () => setUsers(prevUsers => prevUsers.filter(user => user.id !== id)),
            setError,
            ERR_USER_DELETE
        )
    }

    useEffect(() => {
        (async () => {
            await dbOperation<User[]>(db_getUsers, setUsers, setError, ERR_USERS_LOAD);
        })()
    }, [dbOperation]);

    return {users, updateUser, getUserById, deleteUser, error};
}

export default useUsers;