<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can delete the model.
     * PERBAIKAN: Tambahkan tanda '?' dan '= null' pada $model
     * agar fungsi ini bisa menerima pengecekan global (User::class)
     */
    public function delete(User $user, ?User $model = null): bool
    {
        // Ambil list nama role dari user yang sedang login
        $roles = $user->roles->pluck('name')->toArray();

        // ATURAN 1: Bos TIDAK BOLEH delete
        if (in_array('bos', $roles)) {
            return false;
        }

        // ATURAN 2: Super Admin BOLEH delete
        if (in_array('super_admin', $roles)) {
            return true;
        }

        // Default: Staff biasa tidak boleh
        return false;
    }

    // Ijinkan bos & super_admin melihat data (viewAny)
    public function viewAny(User $user): bool
    {
        $roles = $user->roles->pluck('name')->toArray();
        return !empty(array_intersect(['super_admin', 'bos'], $roles));
    }
}
