import { useState } from 'react';
import { templateParser, templateFormatter, parseDigit } from 'input-format';
import ReactInput from 'input-format/react';
import CountrySelector from './CountrySelector';

// US phone number template
// TODO: Make this dynamic based on country
const DEFAULT_TEMPLATE = '(xxx) xxx-xxxx';

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
