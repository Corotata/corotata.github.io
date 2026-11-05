import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import appData from '../data/apps.json';
import {
    APPLE_EULA_URL,
    CONTACT_EMAIL,
    LEGAL_UPDATED,
    PRIVACY,
    SUPPORT,
    buildPrivacySections,
    findPrivacyPage,
    type LegalLang,
} from '../data/legal';

const toLegalLang = (lng: string): LegalLang => {
    if (lng === 'zh-TW' || lng === 'zh-HK' || lng.startsWith('zh-Hant')) return 'zh-TW';
    if (lng.startsWith('zh')) return 'zh';
    return 'en';
};

const linkCls = 'text-primary hover:underline';

type IconApp = { id: number; title: string; icon?: string; url?: string };

// 图标来自 apps.json（每周自动同步）
const AppIcons = ({ title, ids, keywords = [] }: { title: string; ids: number[]; keywords?: string[] }) => {
    const all = appData.apps as unknown as IconApp[];
    const apps = all.filter((a) => ids.includes(a.id) || keywords.some((k) => a.title.toLowerCase().includes(k.toLowerCase())));
    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <ul className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {apps.map((a) => (
                    <li key={a.id}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="block" title={a.title}>
                            {a.icon && <img src={a.icon} alt={a.title} loading="lazy" className="w-full aspect-square rounded-2xl" />}
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
};

const LegalPage = ({ mode }: { mode: 'privacy' | 'support' }) => {
    const { i18n } = useTranslation();
    const { pathname } = useLocation();
    const lang = toLegalLang(i18n.language || 'en');

    if (mode === 'privacy') {
        const page = findPrivacyPage(pathname.replace(/\/$/, ''));
        if (!page) return <Navigate to="/privacy" replace />;
        const c = PRIVACY[lang];
        return (
            <div className="min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">{c.pageTitle()}</h1>
                <p className="text-gray-400 mb-2">{c.intro()}</p>
                <p className="text-gray-500 text-sm mb-10">{c.updated}：{LEGAL_UPDATED}</p>
                <div className="space-y-8">
                    {buildPrivacySections(lang, page.kind).map((s) => (
                        <section key={s.title}>
                            <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
                            {s.body.map((p) => (
                                <p key={p} className="text-gray-300 leading-relaxed mb-2">{p}</p>
                            ))}
                        </section>
                    ))}
                </div>
                <AppIcons title={c.appsTitle} ids={page.appIds} keywords={page.titleKeywords} />
            </div>
        );
    }

    const c = SUPPORT[lang];
    return (
        <div className="min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">{c.all}</h1>
            <p className="text-gray-300 mb-10">{c.intro}</p>
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-3">{c.contactTitle}</h2>
                <p className="text-gray-400 mb-4">{c.contactBody}</p>
                <div className="flex flex-wrap gap-3">
                <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-medium hover:opacity-90"
                >
                    <Mail className="w-5 h-5" />
                    {CONTACT_EMAIL}
                </a>
                {/* 反馈通过用户选择的平台沟通，网站不接收上传文件。 */}
                {[
                    'https://www.xiaohongshu.com/user/profile/5eb65cb60000000001000ce9',
                ].map((url, index) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center px-5 py-3 rounded-full border border-primary text-primary font-medium hover:opacity-80">
                        {c.socialLabels[index]}
                    </a>
                ))}
                </div>
            </section>
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-3">{c.tipsTitle}</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    {c.tips.map((t) => <li key={t}>{t}</li>)}
                </ul>
            </section>
            <section>
                <h2 className="text-xl font-semibold mb-3">{c.linksTitle}</h2>
                <ul className="space-y-2">
                    <li><Link className={linkCls} to="/privacy">{c.privacy}</Link></li>
                    <li><a className={linkCls} href={APPLE_EULA_URL} target="_blank" rel="noopener noreferrer">{c.eula}</a></li>
                </ul>
            </section>
        </div>
    );
};

export default LegalPage;
