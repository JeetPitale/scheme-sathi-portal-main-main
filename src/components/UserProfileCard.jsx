import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ShieldCheck, FileText, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const UserProfileCard = ({ user, stats }) => {
    const { t } = useTranslation();

    return (
        <Card className="h-full border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('profile')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-3xl font-bold text-primary">
                            {user?.fullName?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg">{user?.fullName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        {user?.email || 'No email provided'}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-2 border border-emerald-100">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Citizen
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {stats.total || 0}
                        </p>
                        <p className="text-[10px] text-blue-600/80">Applications</p>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {stats.active || 0}
                        </p>
                        <p className="text-[10px] text-amber-600/80">In Progress</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserProfileCard;
