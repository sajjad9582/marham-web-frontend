"use client";

import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "intl-tel-input/styles";

export type IntlPhoneInputHandle = {
  getE164Number: () => string | null;
  isValid: () => boolean;
  reset: () => void;
};

type IntlPhoneInputProps = {
  placeholder?: string;
  className?: string;
  id?: string;
};

export const IntlPhoneInput = forwardRef<IntlPhoneInputHandle, IntlPhoneInputProps>(
  function IntlPhoneInput(
    { placeholder = "Add Phone Number", className, id },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);

    useImperativeHandle(ref, () => ({
      getE164Number: () => {
        const iti = itiRef.current;
        if (!iti || !iti.isValidNumber()) return null;
        return iti.getNumber();
      },
      isValid: () => itiRef.current?.isValidNumber() === true,
      reset: () => {
        itiRef.current?.setNumber("");
      },
    }));

    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const iti = intlTelInput(input, {
        initialCountry: "pk",
        countrySearch: true,
        countrySelectorMode: "DROPDOWN",
        matchDropdownWidth: true,
        customPlaceholder: () => placeholder,
      });

      itiRef.current = iti;

      return () => {
        iti.destroy();
        itiRef.current = null;
      };
    }, [placeholder]);

    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="tel"
          id={id}
          autoComplete="tel"
        />
      </div>
    );
  },
);
