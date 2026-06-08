export type ValidatePakistanPhoneResult = {
  valid: boolean;
  normalized?: string;
  error?: string;
};

export function validatePakistanPhone(input: string): ValidatePakistanPhoneResult {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return { valid: false, error: "Phone Number is Invalid!" };
  }

  let normalized = digits;

  if (normalized.startsWith("92") && normalized.length === 12) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0") && normalized.length === 11) {
    normalized = normalized.slice(1);
  }

  if (!/^3\d{9}$/.test(normalized)) {
    return { valid: false, error: "Phone Number is Invalid!" };
  }

  return { valid: true, normalized };
}

export function toE164PakistanPhone(normalized: string): string {
  return `+92${normalized}`;
}
