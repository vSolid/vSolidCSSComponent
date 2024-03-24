import { ThingPersisted, UrlString, getBooleanAll, getDatetimeAll, getDecimalAll, getIntegerAll, getStringByLocaleAll, getStringNoLocaleAll, getUrlAll } from "@inrupt/solid-client"
import FieldSet from "../ui/FieldSet";

interface Props {
    thing: ThingPersisted,
    predicate: UrlString
}

function PredicateViewer({ thing, predicate }: Props) {
    const urlValues = getUrlAll(thing, predicate).map(url => <li><a href={url}>{url}</a></li>)
    const stringNoLocaleValues = getStringNoLocaleAll(thing, predicate)
    const integerValues = getIntegerAll(thing, predicate)
    const decimalValues = getDecimalAll(thing, predicate)
    const booleanValues = getBooleanAll(thing, predicate)
    const datetimeValues = getDatetimeAll(thing, predicate).map(date => date.getTime())
    const stringsByLocale = getStringByLocaleAll(thing, predicate)

    const importantSeparatorIndex = Math.max(
        predicate.lastIndexOf("/"),
        predicate.lastIndexOf("#"),
    )
    const noise = predicate.substring(0, importantSeparatorIndex + 1)
    const signal = predicate.substring(importantSeparatorIndex + 1)

    return (
        <FieldSet header={<abbr title={noise + signal}>{signal}</abbr>}>
            {urlValues}
            {stringNoLocaleValues}
            {integerValues}
            {decimalValues}
            {booleanValues}
            {stringsByLocale}
            {datetimeValues}
        </FieldSet>
    )
}

export default PredicateViewer