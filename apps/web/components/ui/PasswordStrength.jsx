import React from 'react';
import { cn } from '../../lib/utils';
export function PasswordStrength({ password = '' }) {
    const calculateStrength = (pass) => {
        if (!pass)
            return { score: 0, label: 'None', color: 'bg-gray-200' };
        let score = 0;
        if (pass.length >= 8)
            score++;
        if (pass.length >= 12)
            score++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass))
            score++;
        if (/\d/.test(pass))
            score++;
        if (/[^a-zA-Z0-9]/.test(pass))
            score++;
        if (score <= 1)
            return { score: 1, label: 'Very weak', color: 'bg-red-500' };
        if (score === 2)
            return { score: 2, label: 'Weak', color: 'bg-amber-500' };
        if (score === 3)
            return { score: 3, label: 'Moderate', color: 'bg-yellow-500' };
        if (score === 4)
            return { score: 4, label: 'Strong', color: 'bg-blue-500' };
        return { score: 5, label: 'Very strong', color: 'bg-green-500' };
    };
    const { score, label, color } = calculateStrength(password);
    if (!password)
        return null;
    return (<div className="mt-2">
      <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((level) => (<div key={level} className={cn('flex-1 transition-all duration-300', level <= score ? color : 'bg-transparent')}/>))}
      </div>
      <p className="text-[11px] text-gray-500 mt-1 font-medium">{label} strength</p>
    </div>);
}
