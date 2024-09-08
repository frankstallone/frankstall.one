import { useState, createElement, forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import classnames from 'classnames';
import { Chevron } from '@ui/svg/chevron';
// https://nucleoapp.com/svg-flag-icons
import { Ukraine } from '@ui/flags/ukraine';
import { UnitedArabEmirates } from '@ui/flags/unitedarabemirates';
import { UnitedKingdom } from '@ui/flags/unitedkingdom';
import { UnitedStates } from '@ui/flags/unitedstates';
import { Uruguay } from '@ui/flags/uruguay';
import { Uzbekistan } from '@ui/flags/uzbekistan';
import { Venezuela } from '@ui/flags/venezuela';
import { Vietnam } from '@ui/flags/vietnam';
import { Yemen } from '@ui/flags/yemen';
import { Zambia } from '@ui/flags/zambia';
import { Zimbabwe } from '@ui/flags/zimbabwe';

interface CountrySelectorProps {
  updateTemplate: (value: string) => void;
}
interface CountryOption {
  value: string;
  label: string;
  icon: React.FC;
}

const options: CountryOption[] = [
  { value: 'UA', label: 'Ukraine', icon: Ukraine },
  {
    value: 'AE',
    label: 'United Arab Emirates',
    icon: UnitedArabEmirates,
  },
  { value: 'GB', label: 'United Kingdom', icon: UnitedKingdom },
  { value: 'US', label: 'United States', icon: UnitedStates },
  { value: 'UY', label: 'Uruguay', icon: Uruguay },
  { value: 'UZ', label: 'Uzbekistan', icon: Uzbekistan },
  { value: 'VE', label: 'Venezuela', icon: Venezuela },
  { value: 'VN', label: 'Vietnam', icon: Vietnam },
  { value: 'YE', label: 'Yemen', icon: Yemen },
  { value: 'ZM', label: 'Zambia', icon: Zambia },
  { value: 'ZW', label: 'Zimbabwe', icon: Zimbabwe },
];

/**
 * CountrySelector component
 * A customized <select> style component for international phone numbers
 * @returns A country selector component
 */

const CountrySelector: React.FC<CountrySelectorProps> = ({
  updateTemplate,
}) => {
  const [country, setCountry] = useState(options[3]);

  const handleSetCountry = (value: string) => {
    setCountry(options.find((option) => option.value === value) || options[3]);
    updateTemplate(value);
  };

  function getCountryFlag(country: CountryOption) {
    return createElement(
      options.find((option) => option.value === country.value)?.icon ||
        UnitedStates,
    );
  }

  return (
    <Select.Root onValueChange={handleSetCountry} defaultValue={country.value}>
      <Select.Trigger className="country-selector-trigger">
        <Select.Icon>
          <Select.Value>{getCountryFlag(country)}</Select.Value>
          <Chevron />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="country-selector-menu">
          <Select.ScrollUpButton />
          <Select.Viewport>
            {options.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {getCountryFlag(option)} {option.label}
              </SelectItem>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
          <Select.Arrow />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
  [key: string]: any;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className={classnames('country-selector-item', className)}
        value={props.value}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    );
  },
);

export default CountrySelector;
