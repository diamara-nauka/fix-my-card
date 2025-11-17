import { createSignal, onMount } from 'solid-js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function DynamicImage() {
  const [imgSrc, setImgSrc] = createSignal('');

  onMount(async () => {
    const { data, error } = await supabase
      .from('image')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error(error);
    } else {
      // si tu as stocké l'image en base64 dans Supabase Storage
      console.log(data)
      setImgSrc(data?.src);
    }
  });

  return <img src={imgSrc()} alt="dynamic" />;
}