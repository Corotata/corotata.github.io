import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../data/legal';

/** 独立联系页：展示可复制邮箱，并提供小红书与应用支持入口。 */
const ContactPage = () => {
    const { i18n } = useTranslation();
    const zh = i18n.language.startsWith('zh');
    const traditional = /TW|HK|Hant/.test(i18n.language);
    /** 当前复制结果，使用状态区域向用户反馈。 */
    const [message, setMessage] = useState('');
    /** 统一选择联系页的中英文文案。 */
    const text = (cn: string, tw: string, en: string) => zh ? traditional ? tw : cn : en;
    /** 复制邮箱；权限不可用时提示手动复制可见地址。 */
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setMessage(text('邮箱已复制', '信箱已複製', 'Email copied'));
        } catch {
            setMessage(text('请选中上方邮箱地址手动复制', '請選取上方信箱地址手動複製', 'Please select and copy the email address above.'));
        }
    };
    return (
        <div className="min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">{text('联系我', '聯絡我', 'Contact me')}</h1>
            <p className="text-gray-300 mb-10">{text('欢迎交流产品、分享建议或洽谈合作。可以通过邮件或小红书联系我。', '歡迎交流產品、分享建議或洽談合作。可以透過電子郵件或小紅書聯絡我。', 'For product conversations, suggestions or collaboration, reach me by email or Xiaohongshu.')}</p>
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-3">{text('邮箱', '電子郵件', 'Email')}</h2>
                <p className="select-text break-all text-gray-300 mb-4">{CONTACT_EMAIL}</p>
                <div className="flex flex-wrap gap-3">
                    <button onClick={copyEmail} className="px-5 py-3 rounded-full bg-primary text-white">{text('复制邮箱', '複製信箱', 'Copy email')}</button>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="px-5 py-3 rounded-full border border-primary text-primary">{text('发送邮件', '傳送郵件', 'Send email')}</a>
                </div>
                <p role="status" className="text-sm text-gray-400 mt-3">{message}</p>
            </section>
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-3">{text('小红书', '小紅書', 'Xiaohongshu')}</h2>
                <a href="https://www.xiaohongshu.com/user/profile/5eb65cb60000000001000ce9" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{text('打开小红书主页', '開啟小紅書主頁', 'Visit Xiaohongshu profile')} ↗</a>
            </section>
            <p className="text-gray-400">{text('App 使用问题，推荐通过 App 内的“用户反馈”发送邮件，减少手动填写信息。', 'App 使用問題，建議透過 App 內的「使用者回饋」傳送郵件，減少手動填寫資訊。', 'For app issues, use Feedback in the app to email with fewer details to enter manually.')}</p>
            <Link to="/support" className="inline-block mt-4 text-primary hover:underline">{text('查看技术支持', '查看技術支援', 'View support')} →</Link>
        </div>
    );
};

export default ContactPage;
