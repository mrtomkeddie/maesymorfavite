import * as firebase from './firebase';
import * as supabase from './supabase';
import { DatabaseProvider } from './types';

const provider = process.env.NEXT_PUBLIC_DB_PROVIDER;

let db: DatabaseProvider;

if (provider === 'supabase') {
    db = supabase;
} else {
    // Default to Firebase
    db = firebase;
}

export { db };
