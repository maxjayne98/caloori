'use client';
import { Identicon } from './identicon';
import { PixelAvatar } from './pixel-avatar';

const PHOTO_SIZE = 192;

/** Center-crops and downsizes a picked image on-device so the stored data URL stays small. */
export async function resizeProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = PHOTO_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare the photo.');
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE,
    PHOTO_SIZE,
  );
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

export const PATTERN_COUNT = 24;
export const PIXEL_COUNT = 24;

type AvatarProfile = { name?: string; photo?: string; avatar?: string };

/** The avatar the profile asks for; older profiles show their photo, else pattern 0. */
export function avatarChoice(profile: AvatarProfile) {
  if (profile.avatar === 'photo' && !profile.photo) return 'pattern:0';
  return profile.avatar ?? (profile.photo ? 'photo' : 'pattern:0');
}

export function patternSeed(seed: string, pattern: number) {
  return pattern ? `${seed}:${pattern}` : seed;
}

/** Renders one avatar choice: photo, first letter of the name, or an identicon pattern. */
export function ProfileAvatar({
  profile,
  seed,
  choice = avatarChoice(profile),
  size = 24,
}: {
  profile: AvatarProfile;
  seed: string;
  choice?: string;
  size?: number;
}) {
  if (choice === 'photo' && profile.photo)
    return <img className="profile-photo" src={profile.photo} alt="" />;
  if (choice === 'initial')
    return (
      <span className="avatar-initial" style={{ fontSize: size * 0.7 }}>
        {profile.name?.trim().slice(0, 1).toUpperCase() || 'Y'}
      </span>
    );
  if (choice.startsWith('pixel:')) return <PixelAvatar seed={`${seed}:pixel:${choice.slice(6)}`} />;
  const pattern = Number(choice.startsWith('pattern:') ? choice.slice(8) : 0);
  return <Identicon seed={patternSeed(seed, pattern)} size={size} />;
}
