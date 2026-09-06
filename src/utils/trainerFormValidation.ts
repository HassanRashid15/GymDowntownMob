import { TrainerFormInput } from '../context/TrainersContext';

export type TrainerFormErrors = Partial<Record<keyof TrainerFormInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

export const validateTrainerForm = (
  form: TrainerFormInput,
  options?: { isEdit?: boolean }
): TrainerFormErrors => {
  const errors: TrainerFormErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  }

  if (!form.address.trim()) {
    errors.address = 'Address is required.';
  } else if (form.address.trim().length < 5) {
    errors.address = 'Enter a complete address.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!form.gender) {
    errors.gender = 'Gender is required.';
  }

  const ageValue = Number(form.age);
  if (!form.age.trim()) {
    errors.age = 'Age is required.';
  } else if (!Number.isInteger(ageValue) || ageValue < 18 || ageValue > 80) {
    errors.age = 'Age must be between 18 and 80.';
  }

  if (!form.bloodGroup) {
    errors.bloodGroup = 'Blood group is required.';
  }

  if (!form.role.trim()) {
    errors.role = 'Role is required.';
  } else if (form.role.trim().length < 2) {
    errors.role = 'Role must be at least 2 characters.';
  }

  const ratingValue = Number(form.rating);
  if (!form.rating.trim()) {
    errors.rating = 'Rating is required.';
  } else if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    errors.rating = 'Rating must be between 1.0 and 5.0.';
  }

  if (!form.image.trim()) {
    errors.image = options?.isEdit ? 'Upload a trainer photo.' : 'Trainer photo is required.';
  }

  const specialties = form.specialties
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (specialties.length === 0) {
    errors.specialties = 'Add at least one specialty.';
  }

  return errors;
};

export const hasFormErrors = (errors: TrainerFormErrors) => Object.keys(errors).length > 0;
