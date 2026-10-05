import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
  /** Expected national number length (digits after dial code). Single number or [min,max]. */
  length: number | [number, number];
}

export const COUNTRY_CODES: CountryCode[] = [
  // Core markets with verified national number lengths
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪", length: 9 },
  { code: "TZ", dial: "+255", name: "Tanzania", flag: "🇹🇿", length: 9 },
  { code: "UG", dial: "+256", name: "Uganda", flag: "🇺🇬", length: 9 },
  { code: "RW", dial: "+250", name: "Rwanda", flag: "🇷🇼", length: 9 },
  { code: "ET", dial: "+251", name: "Ethiopia", flag: "🇪🇹", length: 9 },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬", length: 10 },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭", length: 9 },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦", length: 9 },
  { code: "CD", dial: "+243", name: "DR Congo", flag: "🇨🇩", length: 9 },
  { code: "CM", dial: "+237", name: "Cameroon", flag: "🇨🇲", length: 9 },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸", length: 10 },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦", length: 10 },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪", length: 9 },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦", length: 9 },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳", length: 10 },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳", length: 11 },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪", length: [10, 11] },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷", length: 9 },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺", length: 9 },
  // All remaining countries/territories, alphabetical, with the generic
  // international fallback length [7, 15] (matches isValidInternationalPhone's
  // fallback for unrecognized dial codes).
  { code: "AF", dial: "+93", name: "Afghanistan", flag: "🇦🇫", length: [7, 15] },
  { code: "AL", dial: "+355", name: "Albania", flag: "🇦🇱", length: [7, 15] },
  { code: "DZ", dial: "+213", name: "Algeria", flag: "🇩🇿", length: [7, 15] },
  { code: "AS", dial: "+1684", name: "American Samoa", flag: "🇦🇸", length: [7, 15] },
  { code: "AD", dial: "+376", name: "Andorra", flag: "🇦🇩", length: [7, 15] },
  { code: "AO", dial: "+244", name: "Angola", flag: "🇦🇴", length: [7, 15] },
  { code: "AI", dial: "+1264", name: "Anguilla", flag: "🇦🇮", length: [7, 15] },
  { code: "AG", dial: "+1268", name: "Antigua and Barbuda", flag: "🇦🇬", length: [7, 15] },
  { code: "AR", dial: "+54", name: "Argentina", flag: "🇦🇷", length: [7, 15] },
  { code: "AM", dial: "+374", name: "Armenia", flag: "🇦🇲", length: [7, 15] },
  { code: "AW", dial: "+297", name: "Aruba", flag: "🇦🇼", length: [7, 15] },
  { code: "AT", dial: "+43", name: "Austria", flag: "🇦🇹", length: [7, 15] },
  { code: "AZ", dial: "+994", name: "Azerbaijan", flag: "🇦🇿", length: [7, 15] },
  { code: "BS", dial: "+1242", name: "Bahamas", flag: "🇧🇸", length: [7, 15] },
  { code: "BH", dial: "+973", name: "Bahrain", flag: "🇧🇭", length: [7, 15] },
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "🇧🇩", length: [7, 15] },
  { code: "BB", dial: "+1246", name: "Barbados", flag: "🇧🇧", length: [7, 15] },
  { code: "BY", dial: "+375", name: "Belarus", flag: "🇧🇾", length: [7, 15] },
  { code: "BE", dial: "+32", name: "Belgium", flag: "🇧🇪", length: [7, 15] },
  { code: "BZ", dial: "+501", name: "Belize", flag: "🇧🇿", length: [7, 15] },
  { code: "BJ", dial: "+229", name: "Benin", flag: "🇧🇯", length: [7, 15] },
  { code: "BM", dial: "+1441", name: "Bermuda", flag: "🇧🇲", length: [7, 15] },
  { code: "BT", dial: "+975", name: "Bhutan", flag: "🇧🇹", length: [7, 15] },
  { code: "BO", dial: "+591", name: "Bolivia", flag: "🇧🇴", length: [7, 15] },
  { code: "BA", dial: "+387", name: "Bosnia and Herzegovina", flag: "🇧🇦", length: [7, 15] },
  { code: "BW", dial: "+267", name: "Botswana", flag: "🇧🇼", length: [7, 15] },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷", length: [7, 15] },
  { code: "VG", dial: "+1284", name: "British Virgin Islands", flag: "🇻🇬", length: [7, 15] },
  { code: "BN", dial: "+673", name: "Brunei", flag: "🇧🇳", length: [7, 15] },
  { code: "BG", dial: "+359", name: "Bulgaria", flag: "🇧🇬", length: [7, 15] },
  { code: "BF", dial: "+226", name: "Burkina Faso", flag: "🇧🇫", length: [7, 15] },
  { code: "BI", dial: "+257", name: "Burundi", flag: "🇧🇮", length: [7, 15] },
  { code: "CV", dial: "+238", name: "Cabo Verde", flag: "🇨🇻", length: [7, 15] },
  { code: "KH", dial: "+855", name: "Cambodia", flag: "🇰🇭", length: [7, 15] },
  { code: "KY", dial: "+1345", name: "Cayman Islands", flag: "🇰🇾", length: [7, 15] },
  { code: "CF", dial: "+236", name: "Central African Republic", flag: "🇨🇫", length: [7, 15] },
  { code: "TD", dial: "+235", name: "Chad", flag: "🇹🇩", length: [7, 15] },
  { code: "CL", dial: "+56", name: "Chile", flag: "🇨🇱", length: [7, 15] },
  { code: "CO", dial: "+57", name: "Colombia", flag: "🇨🇴", length: [7, 15] },
  { code: "KM", dial: "+269", name: "Comoros", flag: "🇰🇲", length: [7, 15] },
  { code: "CG", dial: "+242", name: "Congo (Republic)", flag: "🇨🇬", length: [7, 15] },
  { code: "CK", dial: "+682", name: "Cook Islands", flag: "🇨🇰", length: [7, 15] },
  { code: "CR", dial: "+506", name: "Costa Rica", flag: "🇨🇷", length: [7, 15] },
  { code: "HR", dial: "+385", name: "Croatia", flag: "🇭🇷", length: [7, 15] },
  { code: "CU", dial: "+53", name: "Cuba", flag: "🇨🇺", length: [7, 15] },
  { code: "CW", dial: "+599", name: "Curaçao", flag: "🇨🇼", length: [7, 15] },
  { code: "CY", dial: "+357", name: "Cyprus", flag: "🇨🇾", length: [7, 15] },
  { code: "CZ", dial: "+420", name: "Czechia", flag: "🇨🇿", length: [7, 15] },
  { code: "DK", dial: "+45", name: "Denmark", flag: "🇩🇰", length: [7, 15] },
  { code: "DJ", dial: "+253", name: "Djibouti", flag: "🇩🇯", length: [7, 15] },
  { code: "DM", dial: "+1767", name: "Dominica", flag: "🇩🇲", length: [7, 15] },
  { code: "DO", dial: "+1809", name: "Dominican Republic", flag: "🇩🇴", length: [7, 15] },
  { code: "EC", dial: "+593", name: "Ecuador", flag: "🇪🇨", length: [7, 15] },
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬", length: [7, 15] },
  { code: "SV", dial: "+503", name: "El Salvador", flag: "🇸🇻", length: [7, 15] },
  { code: "GQ", dial: "+240", name: "Equatorial Guinea", flag: "🇬🇶", length: [7, 15] },
  { code: "ER", dial: "+291", name: "Eritrea", flag: "🇪🇷", length: [7, 15] },
  { code: "EE", dial: "+372", name: "Estonia", flag: "🇪🇪", length: [7, 15] },
  { code: "SZ", dial: "+268", name: "Eswatini", flag: "🇸🇿", length: [7, 15] },
  { code: "FK", dial: "+500", name: "Falkland Islands", flag: "🇫🇰", length: [7, 15] },
  { code: "FO", dial: "+298", name: "Faroe Islands", flag: "🇫🇴", length: [7, 15] },
  { code: "FJ", dial: "+679", name: "Fiji", flag: "🇫🇯", length: [7, 15] },
  { code: "FI", dial: "+358", name: "Finland", flag: "🇫🇮", length: [7, 15] },
  { code: "GF", dial: "+594", name: "French Guiana", flag: "🇬🇫", length: [7, 15] },
  { code: "PF", dial: "+689", name: "French Polynesia", flag: "🇵🇫", length: [7, 15] },
  { code: "GA", dial: "+241", name: "Gabon", flag: "🇬🇦", length: [7, 15] },
  { code: "GM", dial: "+220", name: "Gambia", flag: "🇬🇲", length: [7, 15] },
  { code: "GE", dial: "+995", name: "Georgia", flag: "🇬🇪", length: [7, 15] },
  { code: "GI", dial: "+350", name: "Gibraltar", flag: "🇬🇮", length: [7, 15] },
  { code: "GR", dial: "+30", name: "Greece", flag: "🇬🇷", length: [7, 15] },
  { code: "GL", dial: "+299", name: "Greenland", flag: "🇬🇱", length: [7, 15] },
  { code: "GD", dial: "+1473", name: "Grenada", flag: "🇬🇩", length: [7, 15] },
  { code: "GP", dial: "+590", name: "Guadeloupe", flag: "🇬🇵", length: [7, 15] },
  { code: "GU", dial: "+1671", name: "Guam", flag: "🇬🇺", length: [7, 15] },
  { code: "GT", dial: "+502", name: "Guatemala", flag: "🇬🇹", length: [7, 15] },
  { code: "GN", dial: "+224", name: "Guinea", flag: "🇬🇳", length: [7, 15] },
  { code: "GW", dial: "+245", name: "Guinea-Bissau", flag: "🇬🇼", length: [7, 15] },
  { code: "GY", dial: "+592", name: "Guyana", flag: "🇬🇾", length: [7, 15] },
  { code: "HT", dial: "+509", name: "Haiti", flag: "🇭🇹", length: [7, 15] },
  { code: "HN", dial: "+504", name: "Honduras", flag: "🇭🇳", length: [7, 15] },
  { code: "HK", dial: "+852", name: "Hong Kong", flag: "🇭🇰", length: [7, 15] },
  { code: "HU", dial: "+36", name: "Hungary", flag: "🇭🇺", length: [7, 15] },
  { code: "IS", dial: "+354", name: "Iceland", flag: "🇮🇸", length: [7, 15] },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "🇮🇩", length: [7, 15] },
  { code: "IR", dial: "+98", name: "Iran", flag: "🇮🇷", length: [7, 15] },
  { code: "IQ", dial: "+964", name: "Iraq", flag: "🇮🇶", length: [7, 15] },
  { code: "IE", dial: "+353", name: "Ireland", flag: "🇮🇪", length: [7, 15] },
  { code: "IL", dial: "+972", name: "Israel", flag: "🇮🇱", length: [7, 15] },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹", length: [7, 15] },
  { code: "CI", dial: "+225", name: "Ivory Coast", flag: "🇨🇮", length: [7, 15] },
  { code: "JM", dial: "+1876", name: "Jamaica", flag: "🇯🇲", length: [7, 15] },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵", length: [7, 15] },
  { code: "JO", dial: "+962", name: "Jordan", flag: "🇯🇴", length: [7, 15] },
  { code: "KZ", dial: "+7", name: "Kazakhstan", flag: "🇰🇿", length: [7, 15] },
  { code: "KI", dial: "+686", name: "Kiribati", flag: "🇰🇮", length: [7, 15] },
  { code: "XK", dial: "+383", name: "Kosovo", flag: "🇽🇰", length: [7, 15] },
  { code: "KW", dial: "+965", name: "Kuwait", flag: "🇰🇼", length: [7, 15] },
  { code: "KG", dial: "+996", name: "Kyrgyzstan", flag: "🇰🇬", length: [7, 15] },
  { code: "LA", dial: "+856", name: "Laos", flag: "🇱🇦", length: [7, 15] },
  { code: "LV", dial: "+371", name: "Latvia", flag: "🇱🇻", length: [7, 15] },
  { code: "LB", dial: "+961", name: "Lebanon", flag: "🇱🇧", length: [7, 15] },
  { code: "LS", dial: "+266", name: "Lesotho", flag: "🇱🇸", length: [7, 15] },
  { code: "LR", dial: "+231", name: "Liberia", flag: "🇱🇷", length: [7, 15] },
  { code: "LY", dial: "+218", name: "Libya", flag: "🇱🇾", length: [7, 15] },
  { code: "LI", dial: "+423", name: "Liechtenstein", flag: "🇱🇮", length: [7, 15] },
  { code: "LT", dial: "+370", name: "Lithuania", flag: "🇱🇹", length: [7, 15] },
  { code: "LU", dial: "+352", name: "Luxembourg", flag: "🇱🇺", length: [7, 15] },
  { code: "MO", dial: "+853", name: "Macau", flag: "🇲🇴", length: [7, 15] },
  { code: "MG", dial: "+261", name: "Madagascar", flag: "🇲🇬", length: [7, 15] },
  { code: "MW", dial: "+265", name: "Malawi", flag: "🇲🇼", length: [7, 15] },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "🇲🇾", length: [7, 15] },
  { code: "MV", dial: "+960", name: "Maldives", flag: "🇲🇻", length: [7, 15] },
  { code: "ML", dial: "+223", name: "Mali", flag: "🇲🇱", length: [7, 15] },
  { code: "MT", dial: "+356", name: "Malta", flag: "🇲🇹", length: [7, 15] },
  { code: "MH", dial: "+692", name: "Marshall Islands", flag: "🇲🇭", length: [7, 15] },
  { code: "MQ", dial: "+596", name: "Martinique", flag: "🇲🇶", length: [7, 15] },
  { code: "MR", dial: "+222", name: "Mauritania", flag: "🇲🇷", length: [7, 15] },
  { code: "MU", dial: "+230", name: "Mauritius", flag: "🇲🇺", length: [7, 15] },
  { code: "MX", dial: "+52", name: "Mexico", flag: "🇲🇽", length: [7, 15] },
  { code: "FM", dial: "+691", name: "Micronesia", flag: "🇫🇲", length: [7, 15] },
  { code: "MD", dial: "+373", name: "Moldova", flag: "🇲🇩", length: [7, 15] },
  { code: "MC", dial: "+377", name: "Monaco", flag: "🇲🇨", length: [7, 15] },
  { code: "MN", dial: "+976", name: "Mongolia", flag: "🇲🇳", length: [7, 15] },
  { code: "ME", dial: "+382", name: "Montenegro", flag: "🇲🇪", length: [7, 15] },
  { code: "MS", dial: "+1664", name: "Montserrat", flag: "🇲🇸", length: [7, 15] },
  { code: "MA", dial: "+212", name: "Morocco", flag: "🇲🇦", length: [7, 15] },
  { code: "MZ", dial: "+258", name: "Mozambique", flag: "🇲🇿", length: [7, 15] },
  { code: "MM", dial: "+95", name: "Myanmar", flag: "🇲🇲", length: [7, 15] },
  { code: "NA", dial: "+264", name: "Namibia", flag: "🇳🇦", length: [7, 15] },
  { code: "NR", dial: "+674", name: "Nauru", flag: "🇳🇷", length: [7, 15] },
  { code: "NP", dial: "+977", name: "Nepal", flag: "🇳🇵", length: [7, 15] },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱", length: [7, 15] },
  { code: "NC", dial: "+687", name: "New Caledonia", flag: "🇳🇨", length: [7, 15] },
  { code: "NZ", dial: "+64", name: "New Zealand", flag: "🇳🇿", length: [7, 15] },
  { code: "NI", dial: "+505", name: "Nicaragua", flag: "🇳🇮", length: [7, 15] },
  { code: "NE", dial: "+227", name: "Niger", flag: "🇳🇪", length: [7, 15] },
  { code: "NU", dial: "+683", name: "Niue", flag: "🇳🇺", length: [7, 15] },
  { code: "KP", dial: "+850", name: "North Korea", flag: "🇰🇵", length: [7, 15] },
  { code: "MK", dial: "+389", name: "North Macedonia", flag: "🇲🇰", length: [7, 15] },
  { code: "MP", dial: "+1670", name: "Northern Mariana Islands", flag: "🇲🇵", length: [7, 15] },
  { code: "NO", dial: "+47", name: "Norway", flag: "🇳🇴", length: [7, 15] },
  { code: "OM", dial: "+968", name: "Oman", flag: "🇴🇲", length: [7, 15] },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "🇵🇰", length: [7, 15] },
  { code: "PW", dial: "+680", name: "Palau", flag: "🇵🇼", length: [7, 15] },
  { code: "PS", dial: "+970", name: "Palestine", flag: "🇵🇸", length: [7, 15] },
  { code: "PA", dial: "+507", name: "Panama", flag: "🇵🇦", length: [7, 15] },
  { code: "PG", dial: "+675", name: "Papua New Guinea", flag: "🇵🇬", length: [7, 15] },
  { code: "PY", dial: "+595", name: "Paraguay", flag: "🇵🇾", length: [7, 15] },
  { code: "PE", dial: "+51", name: "Peru", flag: "🇵🇪", length: [7, 15] },
  { code: "PH", dial: "+63", name: "Philippines", flag: "🇵🇭", length: [7, 15] },
  { code: "PL", dial: "+48", name: "Poland", flag: "🇵🇱", length: [7, 15] },
  { code: "PT", dial: "+351", name: "Portugal", flag: "🇵🇹", length: [7, 15] },
  { code: "PR", dial: "+1787", name: "Puerto Rico", flag: "🇵🇷", length: [7, 15] },
  { code: "QA", dial: "+974", name: "Qatar", flag: "🇶🇦", length: [7, 15] },
  { code: "RE", dial: "+262", name: "Réunion", flag: "🇷🇪", length: [7, 15] },
  { code: "RO", dial: "+40", name: "Romania", flag: "🇷🇴", length: [7, 15] },
  { code: "RU", dial: "+7", name: "Russia", flag: "🇷🇺", length: [7, 15] },
  { code: "KN", dial: "+1869", name: "Saint Kitts and Nevis", flag: "🇰🇳", length: [7, 15] },
  { code: "LC", dial: "+1758", name: "Saint Lucia", flag: "🇱🇨", length: [7, 15] },
  { code: "PM", dial: "+508", name: "Saint Pierre and Miquelon", flag: "🇵🇲", length: [7, 15] },
  { code: "VC", dial: "+1784", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", length: [7, 15] },
  { code: "WS", dial: "+685", name: "Samoa", flag: "🇼🇸", length: [7, 15] },
  { code: "SM", dial: "+378", name: "San Marino", flag: "🇸🇲", length: [7, 15] },
  { code: "ST", dial: "+239", name: "São Tomé and Príncipe", flag: "🇸🇹", length: [7, 15] },
  { code: "SN", dial: "+221", name: "Senegal", flag: "🇸🇳", length: [7, 15] },
  { code: "RS", dial: "+381", name: "Serbia", flag: "🇷🇸", length: [7, 15] },
  { code: "SC", dial: "+248", name: "Seychelles", flag: "🇸🇨", length: [7, 15] },
  { code: "SL", dial: "+232", name: "Sierra Leone", flag: "🇸🇱", length: [7, 15] },
  { code: "SG", dial: "+65", name: "Singapore", flag: "🇸🇬", length: [7, 15] },
  { code: "SX", dial: "+1721", name: "Sint Maarten", flag: "🇸🇽", length: [7, 15] },
  { code: "SK", dial: "+421", name: "Slovakia", flag: "🇸🇰", length: [7, 15] },
  { code: "SI", dial: "+386", name: "Slovenia", flag: "🇸🇮", length: [7, 15] },
  { code: "SB", dial: "+677", name: "Solomon Islands", flag: "🇸🇧", length: [7, 15] },
  { code: "SO", dial: "+252", name: "Somalia", flag: "🇸🇴", length: [7, 15] },
  { code: "KR", dial: "+82", name: "South Korea", flag: "🇰🇷", length: [7, 15] },
  { code: "SS", dial: "+211", name: "South Sudan", flag: "🇸🇸", length: [7, 15] },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸", length: [7, 15] },
  { code: "LK", dial: "+94", name: "Sri Lanka", flag: "🇱🇰", length: [7, 15] },
  { code: "SD", dial: "+249", name: "Sudan", flag: "🇸🇩", length: [7, 15] },
  { code: "SR", dial: "+597", name: "Suriname", flag: "🇸🇷", length: [7, 15] },
  { code: "SE", dial: "+46", name: "Sweden", flag: "🇸🇪", length: [7, 15] },
  { code: "CH", dial: "+41", name: "Switzerland", flag: "🇨🇭", length: [7, 15] },
  { code: "SY", dial: "+963", name: "Syria", flag: "🇸🇾", length: [7, 15] },
  { code: "TW", dial: "+886", name: "Taiwan", flag: "🇹🇼", length: [7, 15] },
  { code: "TJ", dial: "+992", name: "Tajikistan", flag: "🇹🇯", length: [7, 15] },
  { code: "TH", dial: "+66", name: "Thailand", flag: "🇹🇭", length: [7, 15] },
  { code: "TL", dial: "+670", name: "Timor-Leste", flag: "🇹🇱", length: [7, 15] },
  { code: "TG", dial: "+228", name: "Togo", flag: "🇹🇬", length: [7, 15] },
  { code: "TO", dial: "+676", name: "Tonga", flag: "🇹🇴", length: [7, 15] },
  { code: "TT", dial: "+1868", name: "Trinidad and Tobago", flag: "🇹🇹", length: [7, 15] },
  { code: "TN", dial: "+216", name: "Tunisia", flag: "🇹🇳", length: [7, 15] },
  { code: "TR", dial: "+90", name: "Turkey", flag: "🇹🇷", length: [7, 15] },
  { code: "TM", dial: "+993", name: "Turkmenistan", flag: "🇹🇲", length: [7, 15] },
  { code: "TC", dial: "+1649", name: "Turks and Caicos Islands", flag: "🇹🇨", length: [7, 15] },
  { code: "TV", dial: "+688", name: "Tuvalu", flag: "🇹🇻", length: [7, 15] },
  { code: "UA", dial: "+380", name: "Ukraine", flag: "🇺🇦", length: [7, 15] },
  { code: "UY", dial: "+598", name: "Uruguay", flag: "🇺🇾", length: [7, 15] },
  { code: "UZ", dial: "+998", name: "Uzbekistan", flag: "🇺🇿", length: [7, 15] },
  { code: "VU", dial: "+678", name: "Vanuatu", flag: "🇻🇺", length: [7, 15] },
  { code: "VA", dial: "+379", name: "Vatican City", flag: "🇻🇦", length: [7, 15] },
  { code: "VE", dial: "+58", name: "Venezuela", flag: "🇻🇪", length: [7, 15] },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "🇻🇳", length: [7, 15] },
  { code: "WF", dial: "+681", name: "Wallis and Futuna", flag: "🇼🇫", length: [7, 15] },
  { code: "YE", dial: "+967", name: "Yemen", flag: "🇾🇪", length: [7, 15] },
  { code: "ZM", dial: "+260", name: "Zambia", flag: "🇿🇲", length: [7, 15] },
  { code: "ZW", dial: "+263", name: "Zimbabwe", flag: "🇿🇼", length: [7, 15] },
];

/**
 * Parse a full international phone string (e.g. "+254712345678") into
 * { dialCode, number } using the known COUNTRY_CODES list.
 */
export function parsePhone(fullPhone: string): { dialCode: string; number: string } {
  if (!fullPhone) return { dialCode: "+254", number: "" };

  // Try matching longest dial code first
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const cc of sorted) {
    if (fullPhone.startsWith(cc.dial)) {
      return { dialCode: cc.dial, number: fullPhone.slice(cc.dial.length) };
    }
  }
  return { dialCode: "+254", number: fullPhone.replace(/^\+/, "") };
}

/**
 * Format number for WhatsApp URL (strip + and spaces).
 */
export function formatForWhatsApp(fullPhone: string): string {
  return fullPhone.replace(/[^0-9]/g, "");
}

/** Validate a full international phone against the selected country's expected digit length. */
export function isValidInternationalPhone(fullPhone: string): boolean {
  if (!fullPhone || !fullPhone.startsWith("+")) return false;
  const { dialCode, number } = parsePhone(fullPhone);
  const digits = number.replace(/\D/g, "");
  const cc = COUNTRY_CODES.find((c) => c.dial === dialCode);
  if (!cc) return digits.length >= 7 && digits.length <= 15;
  const len = cc.length;
  if (Array.isArray(len)) return digits.length >= len[0] && digits.length <= len[1];
  return digits.length === len;
}

interface PhoneInputProps {
  value: string; // full international number e.g. "+254712345678"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "712 345 678", disabled, className, error }, ref) => {
    const { dialCode, number } = parsePhone(value);

    const handleDialCodeChange = (newDial: string) => {
      onChange(newDial + number);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow digits and spaces
      const cleaned = e.target.value.replace(/[^\d\s]/g, "");
      onChange(dialCode + cleaned.replace(/\s/g, ""));
    };

    return (
      <div className={cn("flex gap-2", className)}>
        <Select value={dialCode} onValueChange={handleDialCodeChange} disabled={disabled}>
          <SelectTrigger className={cn("w-[120px] shrink-0", error && "border-destructive")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {COUNTRY_CODES.filter((cc, i, arr) =>
              arr.findIndex((c) => c.dial === cc.dial) === i
            ).map((cc) => (
              <SelectItem key={cc.code} value={cc.dial}>
                <span className="flex items-center gap-2">
                  <span>{cc.flag}</span>
                  <span className="text-xs text-muted-foreground">{cc.dial}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
