import { useState } from 'react';
import { templateParser, templateFormatter, parseDigit } from 'input-format';
import ReactInput from 'input-format/react';
import CountrySelector from './CountrySelector';
// import flags from '../flags/index.json';

// US phone number template
// TODO: Make this dynamic based on country
const DEFAULT_TEMPLATE = '(xxx) xxx-xxxx';

// function updateTemplate(iso: string) {
//   const country = flags.find((country: any) => country.iso === iso);
//   if (!country) return DEFAULT_TEMPLATE;
//   if (Array.isArray(country.mask)) {
//     return country.mask[0];
//   } else {
//     return country.mask;
//   }
// }

const parse = templateParser(DEFAULT_TEMPLATE, parseDigit);
const format = templateFormatter(DEFAULT_TEMPLATE);

/**
 * PhoneInput component
 * A controlled input component with input masking for phone numbers
 * @returns A phone input component
 */

export default function PhoneInput() {
  const [value, setValue] = useState('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | string | undefined,
  ) => {
    setValue(typeof event === 'string' ? event : event?.target.value || '');
  };

  return (
    <div className="phone-input-container">
      <CountrySelector />
      <ReactInput
        className="phone-input"
        value={value}
        onChange={handleChange}
        placeholder="Enter phone number"
        parse={parse}
        format={format}
      />
    </div>
  );
}
