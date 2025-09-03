

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { HelpButton } from '@/components/tutorial/HelpButton'
import { useTutorial, Tutorial } from '@/contexts/TutorialProvider'
import { useLanguage } from '@/contexts/LanguageProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, UtensilsCrossed } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WeeklyMenu, DailyMenu } from '@/lib/types'
import { db } from '@/lib/db'

export default function AdminMenu() {
  const { toast } = useToast()
  const { language } = useLanguage()
  useTutorial() // keep tutorial context initialized

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
  type Day = typeof days[number]

  const emptyDaily: DailyMenu = { main: '', alt: '', dessert: '' }
  const defaultWeekly: WeeklyMenu = {
    monday: { ...emptyDaily },
    tuesday: { ...emptyDaily },
    wednesday: { ...emptyDaily },
    thursday: { ...emptyDaily },
    friday: { ...emptyDaily },
  }

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(defaultWeekly)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await db.getWeeklyMenu()
        if (!mounted) return
        setWeeklyMenu(data ?? defaultWeekly)
      } catch (err) {
        console.error(err)
        toast({
          title: language === 'en' ? 'Failed to load menu' : 'Methu llwytho bwydlen',
          description: language === 'en' ? 'Please try again later.' : 'Ceisiwch eto yn hwyrach.',
          variant: 'destructive',
        })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const handleChange = (day: Day, field: keyof DailyMenu, value: string) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] ?? emptyDaily),
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await db.updateWeeklyMenu(weeklyMenu)
      toast({
        title: language === 'en' ? 'Menu saved' : 'Bwydlen wedi’i chadw',
        description: language === 'en' ? 'Weekly lunch menu updated successfully.' : 'Diweddarwyd y fwydlen wythnosol yn llwyddiannus.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: language === 'en' ? 'Save failed' : 'Methodd cadw',
        description: language === 'en' ? 'Please check your input and try again.' : 'Gwiriwch eich mewnbwn a rhowch gynnig arall.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const menuTutorials: Tutorial[] = [
    {
      id: 'menu-management',
      title: language === 'en' ? 'Menu Management' : 'Rheoli Bwydlen',
      description:
        language === 'en'
          ? 'Manage weekly lunch menu for the school.'
          : 'Rheoli bwydlen cinio wythnosol yr ysgol.',
      steps: [
        {
          id: 'overview',
          target: '[data-tutorial="menu-overview"]',
          title: language === 'en' ? 'Weekly Menu Overview' : 'Trosolwg Bwydlen Wythnosol',
          content:
            language === 'en'
              ? 'Edit meals for each weekday and click Save when done.'
              : 'Golygu prydau ar gyfer pob diwrnod gwaith a chlicio Cadw pan fyddwch wedi gorffen.',
          position: 'bottom',
        },
        {
          id: 'save-menu',
          target: '[data-tutorial="save-menu-button"]',
          title: language === 'en' ? 'Save Changes' : 'Cadw Newidiadau',
          content:
            language === 'en'
              ? 'Click this button to save the weekly menu.'
              : 'Cliciwch y botwm hwn i gadw’r fwydlen wythnosol.',
          position: 'left',
          action: 'click',
        },
      ],
    },
  ]

  return (
    <>
      <div className="space-y-6" data-tutorial="menu-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {language === 'en' ? 'Weekly Lunch Menu' : 'Bwydlen Cinio Wythnosol'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'en'
                  ? 'Configure the meals served each day.'
                  : 'Ffurfweddu’r prydau a weinir bob dydd.'}
              </p>
            </div>
          </div>
          <Button data-tutorial="save-menu-button" onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'en' ? 'Save Menu' : 'Cadw Bwydlen'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'en' ? 'Weekly Menu' : 'Bwydlen Wythnosol'}</CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Enter main, alternative, and dessert for each weekday.'
                : 'Nodwch brif gwrs, dewis arall a phwdin ar gyfer pob diwrnod gwaith.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {days.map((day) => (
                  <div key={day} className="rounded-md border p-4">
                    <h3 className="mb-4 text-lg font-semibold capitalize">{day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`${day}-main`}>{language === 'en' ? 'Main' : 'Prif Gwrs'}</Label>
                        <Input
                          id={`${day}-main`}
                          placeholder={language === 'en' ? 'e.g. Shepherd’s Pie' : 'e.e. Pastai Bugail'}
                          value={weeklyMenu?.[day]?.main ?? ''}
                          onChange={(e) => handleChange(day, 'main', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${day}-alt`}>{language === 'en' ? 'Alternative' : 'Dewis Arall'}</Label>
                        <Input
                          id={`${day}-alt`}
                          placeholder={language === 'en' ? 'e.g. Jacket Potato with Beans' : 'e.e. Tatws Jac gyda Ffa'}
                          value={weeklyMenu?.[day]?.alt ?? ''}
                          onChange={(e) => handleChange(day, 'alt', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${day}-dessert`}>{language === 'en' ? 'Dessert' : 'Pwdin'}</Label>
                        <Input
                          id={`${day}-dessert`}
                          placeholder={language === 'en' ? 'e.g. Fruit Salad' : 'e.e. Salad Ffrwythau'}
                          value={weeklyMenu?.[day]?.dessert ?? ''}
                          onChange={(e) => handleChange(day, 'dessert', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <HelpButton tutorials={menuTutorials} position="bottom-right" />
    </>
  )
}
