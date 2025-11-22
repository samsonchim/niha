import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    dvaAccountNumber?: string;
    dvaBankName?: string;
    usdcAddress?: string;
    erc20Address?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, dva_account_number, dva_bank_name, usdc_address, erc20_address')
        .eq('id', userId)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        dvaAccountNumber: data.dva_account_number,
        dvaBankName: data.dva_bank_name,
        usdcAddress: data.usdc_address,
        erc20Address: data.erc20_address,
    };
}
