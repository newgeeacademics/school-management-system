import { useRegister, useLink } from '@refinedev/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader } from '@/components/refine-ui/form/file-uploader';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '@/constants';
import { UserRole } from '@/types';
import { toast } from 'sonner';

const registerSchema = z.object({
  // Compte d'accès
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z
    .string()
    .min(3, "Le nom du responsable doit contenir au moins 3 caractères"),
  role: z.nativeEnum(UserRole),
  image: z.string().optional(),

  // Établissement
  schoolName: z
    .string()
    .min(3, "Le nom de l’école est requis"),
  schoolType: z
    .string()
    .min(2, "Le type d’école est requis"),
  system: z
    .string()
    .min(2, "Le système scolaire est requis"),

  // Localisation
  country: z
    .string()
    .min(2, "Le pays est requis"),
  city: z
    .string()
    .min(2, "La ville est requise"),
  district: z.string().optional(),
  address: z
    .string()
    .min(5, "L’adresse précise est requise"),
  gpsLocation: z.string().optional(),

  // Coordonnées
  mainPhone: z
    .string()
    .min(6, "Le numéro principal est requis"),
  officialEmail: z
    .string()
    .email("Adresse e-mail officielle invalide"),
  website: z
    .string()
    .url("URL invalide")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  // Responsable
  directorName: z
    .string()
    .min(3, "Le nom du responsable est requis"),
  directorPhone: z
    .string()
    .min(6, "Le numéro du responsable est requis"),

  // Effectifs
  studentsCount: z.string().optional(),
  teachersCount: z.string().optional(),
  series: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type OsmResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type SelectedCoords = {
  lat: number;
  lon: number;
};

export const SignUpForm = () => {
  const Link = useLink();
  const [profile, setProfile] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: register } = useRegister();

  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<OsmResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<SelectedCoords | null>(
    null
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: UserRole.ADMIN,
      image: '',
      schoolName: '',
      schoolType: '',
      system: 'Système ivoirien',
      country: 'Côte d’Ivoire',
      city: '',
      district: '',
      address: '',
      gpsLocation: '',
      mainPhone: '',
      officialEmail: '',
      website: '',
      directorName: '',
      directorPhone: '',
      studentsCount: '',
      teachersCount: '',
      series: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      let imageUrl: string | undefined;
      let imageCldPubId: string | undefined;

      if (profile?.length > 0) {
        const formData = new FormData();
        formData.append('file', profile?.[0]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Échec du téléversement du logo');
        }

        const uploadedImage = await response.json();

        if (uploadedImage.error) {
          throw new Error(
            uploadedImage.error.message || 'Téléversement du logo échoué'
          );
        }

        imageUrl = uploadedImage.url;
        imageCldPubId = uploadedImage.public_id;
      }

      register(
        {
          ...values,
          image: imageUrl,
          imageCldPubId,
          role: UserRole.ADMIN,
        },
        {
          onSuccess: (data) => {
            if (data.success === false) {
              toast.error(data.error?.message, {
                richColors: true,
              });
              return;
            }

            toast.success('Compte établissement créé avec succès !', {
              richColors: true,
            });
            form.reset();
            setProfile([]);
            setAddressQuery('');
            setAddressResults([]);
            setSelectedCoords(null);
          },
        }
      );
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Échec de l’inscription", {
        richColors: true,
      });
      setProfile([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAddress = async () => {
    if (!addressQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        addressQuery
      )}&format=json&addressdetails=1&limit=5`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'classroom-app/1.0',
        },
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la recherche d’adresse');
      }
      const data = (await res.json()) as OsmResult[];
      setAddressResults(data);
    } catch (error) {
      console.error(error);
      setSearchError(
        "Impossible de trouver l’adresse pour le moment. Veuillez réessayer."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: OsmResult) => {
    form.setValue('address', result.display_name);
    form.setValue('gpsLocation', `${result.lat}, ${result.lon}`);
    setAddressQuery(result.display_name);
    setAddressResults([]);

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      setSelectedCoords({ lat, lon });
    } else {
      setSelectedCoords(null);
    }
  };

  return (
    <div className='grain-texture-light flex flex-col items-center justify-center p-4 md:px-6 md:py-8 min-h-svh'>
      <Card className='sm:w-full w-full max-w-[900px] p-8 mt-4 md:mt-6 relative overflow-hidden bg-gray-0 border-0'>
        <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-orange' />

        <CardHeader className='px-0 relative z-10'>
          <CardTitle className='text-3xl font-bold mb-2 text-gradient-orange'>
            Inscription établissement
          </CardTitle>
          <CardDescription className='text-gray-900 font-medium text-base'>
            Renseignez les informations de votre école pour créer votre compte
            administrateur.
          </CardDescription>
        </CardHeader>

        <CardContent className='px-0 relative z-10'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Section : Établissement */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Informations sur l&apos;école
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='schoolName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Nom de l&apos;école{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : Groupe scolaire Les Étoiles'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='schoolType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Type d&apos;école{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Choisissez un type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Maternelle'>Maternelle</SelectItem>
                              <SelectItem value='Primaire'>Primaire</SelectItem>
                              <SelectItem value='Secondaire'>
                                Secondaire (collège / lycée)
                              </SelectItem>
                              <SelectItem value='Université'>
                                Université
                              </SelectItem>
                              <SelectItem value='Centre de formation'>
                                Centre de formation
                              </SelectItem>
                              <SelectItem value='Autre'>Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='system'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Système scolaire{' '}
                        <span className='text-orange-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Choisissez un système' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Système ivoirien'>
                              Système ivoirien
                            </SelectItem>
                            <SelectItem value='Système français'>
                              Système français
                            </SelectItem>
                            <SelectItem value='International'>
                              International (IB, Cambridge…)
                            </SelectItem>
                            <SelectItem value='Autre'>Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section : Localisation */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Localisation
                </h3>

                {/* Barre de recherche OpenStreetMap */}
                <div className='space-y-2'>
                  <Label className='text-gray-900 font-semibold'>
                    Rechercher une adresse (OpenStreetMap)
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      placeholder="Ex : École, rue, quartier..."
                      className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11 flex-1'
                    />
                    <Button
                      type='button'
                      size='sm'
                      onClick={searchAddress}
                      disabled={isSearching}
                      className='h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold'
                    >
                      {isSearching ? 'Recherche...' : 'Rechercher'}
                    </Button>
                  </div>

                  {searchError && (
                    <p className='text-xs text-red-500 mt-1'>{searchError}</p>
                  )}

                  {addressResults.length > 0 && (
                    <div className='mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white text-xs'>
                      {addressResults.map((r) => (
                        <button
                          key={r.place_id}
                          type='button'
                          onClick={() => handleSelectResult(r)}
                          className='w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-b-0 border-slate-100'
                        >
                          {r.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Pays <span className='text-orange-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Choisissez un pays' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Côte d’Ivoire'>
                              Côte d’Ivoire
                            </SelectItem>
                            <SelectItem value='France'>France</SelectItem>
                            <SelectItem value='Sénégal'>Sénégal</SelectItem>
                            <SelectItem value='Mali'>Mali</SelectItem>
                            <SelectItem value='Autre'>Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Ville <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : Abidjan'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='district'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Commune / quartier
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : Cocody, Yopougon...'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Adresse précise{' '}
                        <span className='text-orange-600'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Rue, lot, repère...'
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setAddressQuery(e.target.value);
                          }}
                          className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='gpsLocation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Localisation GPS (optionnel)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Coordonnées GPS lat, lon'
                          {...field}
                          className='bg-gray-0 border-2 border-gray-200 transition-all duration-300 h-11'
                          onChange={(e) => {
                            field.onChange(e);
                            const [latStr, lonStr] = e.target.value
                              .split(',')
                              .map((v) => v.trim());
                            const lat = parseFloat(latStr);
                            const lon = parseFloat(lonStr);
                            if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                              setSelectedCoords({ lat, lon });
                            } else {
                              setSelectedCoords(null);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCoords && (
                  <div className='space-y-2'>
                    <Label className='text-gray-900 font-semibold'>
                      Carte OpenStreetMap
                    </Label>
                    {(() => {
                      const { lat, lon } = selectedCoords;
                      const delta = 0.01;
                      const bbox = `${lon - delta},${lat - delta},${
                        lon + delta
                      },${lat + delta}`;
                      const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
                        bbox
                      )}&layer=mapnik&marker=${lat},${lon}`;
                      const viewUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
                      return (
                        <>
                          <div className='rounded-md overflow-hidden border border-slate-200'>
                            <iframe
                              title='Carte OpenStreetMap'
                              src={embedUrl}
                              className='w-full h-48'
                              loading='lazy'
                            />
                          </div>
                          <a
                            href={viewUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='text-xs text-blue-600 hover:underline'
                          >
                            Ouvrir dans OpenStreetMap
                          </a>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Section : Coordonnées & logo */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Coordonnées et logo
                </h3>
                <div className='flex flex-col gap-3'>
                  <Label className='text-gray-900 font-semibold'>
                    Logo de l&apos;école
                  </Label>

                  <FileUploader
                    files={profile}
                    onChange={setProfile}
                    type='profile'
                    maxSizeText="PNG, JPG jusqu'à 3MB"
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='mainPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Numéro principal{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : +225 01 23 45 67 89'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='officialEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          E-mail officiel de l&apos;école{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='contact@mon-ecole.ci'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Site web (optionnel)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://www.mon-ecole.ci'
                          {...field}
                          className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section : Responsable de l’établissement */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Responsable de l&apos;établissement
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='directorName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Nom du responsable (directeur / fondateur){' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Jean Dupont'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='directorPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Numéro du responsable{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Ex : +225 07 00 00 00 00'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section : Compte de connexion administrateur */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Compte de connexion administrateur
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          E-mail de connexion{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='E-mail utilisé pour se connecter'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Mot de passe du compte administrateur{' '}
                          <span className='text-orange-600'>*</span>
                        </FormLabel>
                        <FormControl>
                          <InputPassword
                            {...field}
                            placeholder='Entrez un mot de passe sécurisé'
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section : Effectifs */}
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>Effectifs</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='studentsCount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Nombre d&apos;élèves (approx.)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            placeholder='Ex : 350'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='teachersCount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-900 font-semibold'>
                          Nombre d&apos;enseignants (approx.)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            placeholder='Ex : 24'
                            {...field}
                            className='bg-gray-0 border-2 border-gray-200 transition-all durée-300 h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='series'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-900 font-semibold'>
                        Séries proposées (si secondaire)
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Choisissez une série' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='A'>Série A</SelectItem>
                            <SelectItem value='C'>Série C</SelectItem>
                            <SelectItem value='D'>Série D</SelectItem>
                            <SelectItem value='G1'>Série G1</SelectItem>
                            <SelectItem value='G2'>Série G2</SelectItem>
                            <SelectItem value='Autre'>Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type='submit'
                size='lg'
                className='w-full mt-2 h-12 font-semibold text-white shadow-md cursor-pointer bg-blue-600 hover:bg-blue-700'
                disabled={form.formState.isSubmitting || isLoading}
              >
                {form.formState.isSubmitting || isLoading
                  ? 'Création du compte...'
                  : "Créer le compte de l’école"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className='w-full text-center text-sm px-0'>
          <span className='text-gray-900 mr-2'>
            Vous avez déjà un compte ?
          </span>
          <Link
            to='/login'
            className='font-bold underline hover:no-underline transition-all text-teal-600'
          >
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

