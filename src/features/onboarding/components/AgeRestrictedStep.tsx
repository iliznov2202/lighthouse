import Sticker from '../../../components/Sticker'
import { PrimaryButton, StepHeading } from './shared'

export default function AgeRestrictedStep({ onAcknowledge }: { onAcknowledge: () => void }) {
  return <><div className="registration-welcome-art"><Sticker name="plane" /></div><StepHeading title="Маяк пока доступен с 14 лет" description="Мы работаем над отдельной версией для младших школьников." /><PrimaryButton type="button" onClick={onAcknowledge}>Понятно</PrimaryButton></>
}
