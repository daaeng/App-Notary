<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\User; // <--- JANGAN LUPA IMPORT INI

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->roles,
                ] : null,

                // --- TAMBAHAN BARU ---
                // Kirim permission ke frontend
                'can' => [
                    // Cek policy 'delete' pada model User
                    'delete_user' => $request->user() ? $request->user()->can('delete', User::class) : false,
                ],
            ],
        ];
    }
}
