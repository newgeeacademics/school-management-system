import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SCHOOL_TYPE_OPTIONS = [
  'Maternelle',
  'Primaire',
  'Secondaire',
  'Université',
  'Centre de formation',
  'Autre',
];

const SCHOOL_SYSTEM_OPTIONS = ['Ivoirien', 'Français', 'International', 'Autre'];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [values, setValues] = React.useState({
    name: '',
    type: '',
    system: '',
    country: '',
    city: '',
    district: '',
    address: '',
    gps: '',
    mainPhone: '',
    officialEmail: '',
    headName: '',
    headPhone: '',
    website: '',
    studentCount: '',
    teacherCount: '',
    series: '',
  });

  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ici vous pourriez appeler une API ou stocker en localStorage
    // Pour l’instant on redirige simplement vers le tableau de bord.
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen bg-slate-50 flex px-4 py-6'>
      <div className='w-full max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.4fr,1fr]'>
        <div className='flex flex-col justify-center'>
          <div className='mb-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2'>
              Classroom
            </p>
            <h1 className='text-3xl font-semibold text-slate-900'>
              Inscription de votre établissement
            </h1>
            <p className='mt-2 text-sm text-slate-600'>
              Renseignez les informations de base de votre école pour préparer le
              tableau de bord (classes, enseignants, emplois du temps…).
            </p>
          </div>

          <Card className='shadow-sm border-slate-200'>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription className='text-xs'>
                Ces champs décrivent l&apos;identité et la localisation de votre
                établissement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className='space-y-5 text-xs'
                noValidate
              >
                <div className='grid gap-3 md:grid-cols-2'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='school-name'>Nom de l’école</Label>
                    <Input
                      id='school-name'
                      name='name'
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Ex : Groupe scolaire Les Pionniers"
                      required
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label>Type d’école</Label>
                    <Select
                      value={values.type}
                      onValueChange={(value) =>
                        setValues((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Sélectionner un type' />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-1.5'>
                    <Label>Système scolaire</Label>
                    <Select
                      value={values.system}
                      onValueChange={(value) =>
                        setValues((prev) => ({ ...prev, system: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Ex : Ivoirien, Français…' />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_SYSTEM_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='country'>Pays</Label>
                    <Input
                      id='country'
                      name='country'
                      value={values.country}
                      onChange={handleChange}
                      placeholder='Ex : Côte d’Ivoire'
                      required
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='city'>Ville</Label>
                    <Input
                      id='city'
                      name='city'
                      value={values.city}
                      onChange={handleChange}
                      placeholder='Ex : Abidjan'
                      required
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='district'>Commune / quartier</Label>
                    <Input
                      id='district'
                      name='district'
                      value={values.district}
                      onChange={handleChange}
                      placeholder='Ex : Cocody, Yopougon…'
                    />
                  </div>
                </div>

                <div className='grid gap-3 md:grid-cols-[1.4fr,1fr]'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='address'>Adresse précise</Label>
                    <Textarea
                      id='address'
                      name='address'
                      rows={2}
                      value={values.address}
                      onChange={handleChange}
                      placeholder='Rue, lot, repères pour trouver facilement l’établissement.'
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='gps'>Localisation GPS (lien ou coordonnées)</Label>
                    <Input
                      id='gps'
                      name='gps'
                      value={values.gps}
                      onChange={handleChange}
                      placeholder='Ex : lien Google Maps'
                    />
                  </div>
                </div>

                <div className='grid gap-3 md:grid-cols-2'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='mainPhone'>Numéro principal</Label>
                    <Input
                      id='mainPhone'
                      name='mainPhone'
                      value={values.mainPhone}
                      onChange={handleChange}
                      placeholder='Ex : +225 XX XX XX XX'
                      required
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='officialEmail'>Email officiel</Label>
                    <Input
                      id='officialEmail'
                      type='email'
                      name='officialEmail'
                      value={values.officialEmail}
                      onChange={handleChange}
                      placeholder='contact@ecole.exemple'
                      required
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='headName'>
                      Nom du responsable (directeur / fondateur)
                    </Label>
                    <Input
                      id='headName'
                      name='headName'
                      value={values.headName}
                      onChange={handleChange}
                      placeholder='Ex : Mme Kouadio'
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='headPhone'>Numéro du responsable</Label>
                    <Input
                      id='headPhone'
                      name='headPhone'
                      value={values.headPhone}
                      onChange={handleChange}
                      placeholder='Ex : +225 XX XX XX XX'
                    />
                  </div>
                </div>

                <div className='grid gap-3 md:grid-cols-[1.4fr,1fr]'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='website'>Site web (si disponible)</Label>
                    <Input
                      id='website'
                      type='url'
                      name='website'
                      value={values.website}
                      onChange={handleChange}
                      placeholder='https://…'
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='logo'>Logo de l’école (upload)</Label>
                    <Input
                      id='logo'
                      type='file'
                      accept='image/*'
                      onChange={(e) =>
                        setLogoFile(e.target.files?.[0] ?? null)
                      }
                    />
                    {logoFile && (
                      <p className='text-[10px] text-muted-foreground'>
                        Fichier sélectionné : {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid gap-3 md:grid-cols-3'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='studentCount'>Nombre d’élèves</Label>
                    <Input
                      id='studentCount'
                      type='number'
                      min={0}
                      name='studentCount'
                      value={values.studentCount}
                      onChange={handleChange}
                      placeholder='Ex : 250'
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='teacherCount'>Nombre d’enseignants</Label>
                    <Input
                      id='teacherCount'
                      type='number'
                      min={0}
                      name='teacherCount'
                      value={values.teacherCount}
                      onChange={handleChange}
                      placeholder='Ex : 25'
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='series'>Séries proposées (si secondaire)</Label>
                    <Input
                      id='series'
                      name='series'
                      value={values.series}
                      onChange={handleChange}
                      placeholder='Ex : Série A, C, D…'
                    />
                  </div>
                </div>

                <div className='pt-1 flex items-center justify-between gap-3'>
                  <p className='text-[11px] text-slate-500 leading-relaxed'>
                    Ces informations pourront être modifiées plus tard depuis le
                    tableau de bord.
                  </p>
                  <Button type='submit' size='sm'>
                    Enregistrer l’établissement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className='hidden md:flex h-full w-full items-center'>
          <Card className='w-full shadow-sm border-slate-200'>
            <CardHeader>
              <CardTitle>Aperçu de ce que vous préparez</CardTitle>
              <CardDescription className='text-xs'>
                Ces données alimenteront ensuite les vues &quot;Classes&quot;,
                &quot;Enseignants&quot; et &quot;Emploi du temps&quot; du
                tableau de bord.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 text-xs'>
              <p className='font-medium text-slate-900'>
                {values.name || 'Nom de votre établissement'}
              </p>
              <p className='text-slate-600'>
                {values.type || 'Type non renseigné'} •{' '}
                {values.system || 'Système non renseigné'}
              </p>
              <p className='text-slate-600'>
                {[values.city, values.district, values.country]
                  .filter(Boolean)
                  .join(', ') || 'Localisation à renseigner'}
              </p>
              <p className='text-slate-500'>
                Élèves : {values.studentCount || '—'} • Enseignants :{' '}
                {values.teacherCount || '—'}
              </p>
              {values.series && (
                <p className='text-slate-500'>
                  Séries : <span className='font-medium'>{values.series}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

