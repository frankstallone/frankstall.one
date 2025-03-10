import { useState } from 'react';
import { templateParser, templateFormatter, parseDigit } from 'input-format';
import ReactInput from 'input-format/react';
import CountrySelector from '@ui/CountrySelector';
import countryMasks from '@ui/flags/index.json';

/**
 * PhoneInput component
 * A controlled input component with input masking for phone numbers
 * @returns A phone input component
 */

export default function PhoneInput() {
  // Phone input value
  const [value, setValue] = useState('');
  // US phone number template
  const [template, setTemplate] = useState('(xxx) xxx-xxxx');

  const parse = templateParser(template, parseDigit);
  const format = templateFormatter(template);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | string | undefined,
  ) => {
    setValue(typeof event === 'string' ? event : event?.target.value || '');
  };

  function updateTemplate(iso: string) {
    const countryToUpdate = countryMasks.find(
      (country: any) => country.iso === iso,
    );

    if (!countryToUpdate) return template;
    if (Array.isArray(countryToUpdate.mask)) {
      setTemplate(countryToUpdate.mask[0]);
      setValue('');
    } else {
      setTemplate(countryToUpdate.mask);
      setValue('');
    }
  }

  return (
    <div className="phone-input-container">
      <CountrySelector updateTemplate={updateTemplate} />
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
