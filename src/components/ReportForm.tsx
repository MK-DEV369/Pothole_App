import React, { useState, useRef} from 'react';
import { Camera, Upload, MapPin, AlertTriangle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { createClient } from '@supabase/supabase-js';

interface ReportFormProps {
  onSuccess: () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();        
        const result = await tf.tidy(() => {
          return tf.image.resizeBilinear(tf.browser.fromPixels(img), [224, 224]).toFloat().expandDims();
        });
        console.log(result);
        const isPothole = true;
        if (!isPothole) {
          setError('The uploaded image does not appear to contain a pothole. Please upload a clear image of the road damage.');
          setImage(null);
          setImagePreview('');
        }
      } catch (err) {
        console.error('Error verifying image:', err);
      }
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
  
    try {
      setLoading(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
  
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      console.log("Latitude: " + position.coords.latitude, "Longitude: " + position.coords.longitude);
      setError(null);
    } catch (err: any) {
      if (err instanceof GeolocationPositionError) {
        // Handle specific GeolocationPositionError cases
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permission to access location was denied. Please enable location services.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Try again later.');
            break;
          case err.TIMEOUT:
            setError('The request to get your location timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
        }
      } else {
        console.error('Error getting location:', err);
        setError('Unable to get your location. Please check your device settings.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!image || !location) {
        throw new Error('Please provide both an image and location');
      }
      const { data: imageData, error: imageError } = await supabase.storage
        .from('pothole-images')
        .upload(`${Date.now()}-${image.name}`, image);

        if (imageError) {
          console.error('Image upload error:', imageError.message);
          throw imageError;
        }
      const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pothole-images/${imageData.path}`;
      const { error: reportError } = await supabase
        .from('pothole_reports')
        .insert({
          description,
          severity,
          image_url: imageUrl,
          latitude: location.lat,
          longitude: location.lng,
          status: 'reported'
        });
      alert("Report Successfully Submitted!!!");
      if (reportError) throw reportError;

      onSuccess?.();
      setDescription('');
      setSeverity('medium');
      setImage(null);
      setImagePreview('');
      setLocation(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-[100%] bg-cover bg-fixed bg-center bg-no-repeat bg-blend-overlay animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">Report a Pothole</h2>
            {<div className="bg-red-50 border-l-4 border-orange-400 p-4 rounded animate-fadeIn">
              <div className="flex-col items-center">
                <div className='flex items-center'>
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <div className='ml-3 text-lg text-orange-700'>𝗡𝗼𝘁𝗲</div>
                </div>
                <li className="ml-3 text-orange-700">𝗟𝗼𝘄 𝗦𝗲𝘃𝗲𝗿𝗶𝘁𝘆 Indicates Pothole Dimension is ~ 𝟭 - 𝟭𝟬 𝗰𝗺 (in Size and Depth) where Commuters can travel over.</li>
                <li className="ml-3 text-orange-700">𝗠𝗲𝗱𝗶𝘂𝗺 𝗦𝗲𝘃𝗲𝗿𝗶𝘁𝘆 Indicates Pothole Dimension is ~ 𝟭𝟭 - 𝟯𝟬 𝗰𝗺 (in Size and Depth) where Commuters will Slow down to or Move Around them.</li>
                <li className="ml-3 text-orange-700">𝗛𝗶𝗴𝗵 𝗦𝗲𝘃𝗲𝗿𝗶𝘁𝘆 Indicates Pothole Dimension is ~ 𝗠𝗼𝗿𝗲 𝘁𝗵𝗮𝗻 𝟯𝟭 𝗰𝗺 (in Size and Depth) where Commuters Will Definitely Move Around them.</li>
              </div>
            </div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded animate-fadeIn">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className=" pt-3 block text-sm font-medium text-amber-900">Description of the Pothole</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 bg-white/50 transition-all duration-300"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high')}
              className="mt-1 block w-full text-center rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 bg-white/50 transition-all duration-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col justify-evenly md:flex-row md:space-x-4">
              <div className="mt-1 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.capture = 'environment';
                      fileInputRef.current.click();
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              
            <div className="flex-1">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading}
                className="w-full inline-flex items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
              >
                <MapPin className="h-5 w-5 mr-2" />
                {loading ? 'Getting Location...' : location ? 'Location Captured' : 'Get Location'}
              </button>
            </div>
            </div>
          </div>

          {imagePreview && (
            <div className="mt-4 justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs rounded-lg shadow-md transition-all duration-300 md:max-w-md"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;