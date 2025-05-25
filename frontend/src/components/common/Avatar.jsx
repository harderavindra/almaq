import React, { useEffect, useState } from 'react';
import axios from '../../api/axios'; // adjust path as needed
import avatarPlaceholder from '../../assets/avatar-placeholder.png';

const Avatar = ({ className, size = 'sm', src, name }) => {
  const [imageSrc, setImageSrc] = useState(avatarPlaceholder);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        // Ensure the src is a GCS path before requesting signed URL
        if (src ) {
          const response = await axios.get('/signed-url', {
            params: {
              type: 'view',
              url: src,
            },
          });

          setImageSrc(response.data.signedUrl);
        } else {
          setImageSrc(src || avatarPlaceholder);
        }
      } catch (error) {
        console.error('Failed to fetch signed profile pic URL:', error);
        setImageSrc(avatarPlaceholder);
      }
    };

    fetchSignedUrl();
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-30 h-30',
  };

  return (
    <div className="inline-block relative group">
      <img
        src={imageSrc}
        alt={name || 'User Avatar'}
        onError={() => setImageSrc(avatarPlaceholder)}
        className={`${sizes[size]} rounded-full object-cover ${className} border-0 border-gray-500`}
      />
      {name && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {name}
        </div>
      )}
    </div>
  );
};

export default Avatar;
