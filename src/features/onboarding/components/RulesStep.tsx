import { useState } from 'react'
import { Check } from '../../../design/icons'
import { Modal } from '../../../components/ui'
import { communityRules } from '../mock'
import type { OnboardingController } from '../useOnboarding'
import { FieldError, PrimaryButton, StepHeading } from './shared'

const policyTexts = {
  rules: { title: 'Правила сообщества', text: 'В Маяке мы общаемся с уважением, бережём личные данные и не выдаём себя за других. Травля и угрозы недопустимы. Анонимность скрывает имя от других учеников, но не от модерации.' },
  terms: { title: 'Условия использования', text: 'Это тестовый frontend приложения. Публикации, рейтинги, AI и регистрация демонстрируют будущие возможности. Настоящие аккаунты, сервер и синхронизация в этом сценарии не подключены.' },
  privacy: { title: 'Политика конфиденциальности', text: 'В этой версии введённые данные и фото сохраняются только в браузере на твоём устройстве. На сервер они не отправляются. Пароль не включается в профиль; mock-вход использует локальную проверку. Сброс демо удаляет локальные данные регистрации.' },
}
export default function RulesStep({ controller: c }: { controller: OnboardingController }) {
  const [document, setDocument] = useState<keyof typeof policyTexts | null>(null)
  return <><StepHeading title="В Маяке важно" description="Пять простых правил, чтобы здесь было спокойно и своим." />
    <ul className="registration-rules">{communityRules.map(rule => <li key={rule}><span><Check /></span>{rule}</li>)}</ul>
    <form onSubmit={event => { event.preventDefault(); c.register() }}>
      <label className="registration-consent"><input type="checkbox" checked={c.state.acceptedRules} disabled={c.busy} onChange={event => c.patch({ acceptedRules: event.target.checked })} /><span>Я принимаю <button type="button" onClick={() => setDocument('rules')}>правила сообщества</button> и <button type="button" onClick={() => setDocument('terms')}>условия использования</button></span></label>
      <a className="registration-privacy" href="#privacy" onClick={event => { event.preventDefault(); setDocument('privacy') }}>Политика конфиденциальности</a>
      <FieldError>{c.errors.rules || c.errors.submit}</FieldError>
      <PrimaryButton busy={c.busy} disabled={!c.state.acceptedRules}>{c.busy ? 'Создаём твоё пространство…' : 'Войти в Маяк'}</PrimaryButton>
    </form>
    {document && <Modal title={policyTexts[document].title} onClose={() => setDocument(null)}><span className="tag">Тестовый документ MVP</span><p className="modal-description registration-policy-text">{policyTexts[document].text}</p><button className="button secondary full" onClick={() => setDocument(null)}>Понятно</button></Modal>}
  </>
}
