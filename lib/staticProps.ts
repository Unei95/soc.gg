import { GetStaticProps } from "next";
import { getArtifacts } from "./artifacts";
import { getBuildings } from "./buildings";

import { getFactions } from "./factions";
import { getSkills } from "./skills";
import { getSiteTerm, getTerm, TermsDTO } from "./terms";
import { getUnits } from "./units";
import { getWielders } from "./wielders";

export type CollectionLink = {
  label: string;
  docs: {
    to: string;
    label: string;
    description?: string;
  }[];
};

const sortByLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label);

export const withStaticBase = <T extends { terms?: TermsDTO }>(
  getStaticProps: GetStaticProps<T>
) => {
  const getStaticPropsWithBase: GetStaticProps<
    | (T & {
        collectionLinks: CollectionLink[];
        terms: TermsDTO;
      })
    | T
  > = async (context) => {
    const propsResult = await getStaticProps(context);
    if (
      (propsResult as { notFound: true; revalidate?: number | boolean })
        .notFound
    ) {
      return propsResult;
    }

    const locale = context.locale!;
    const factions = getFactions(locale).filter(
      (faction) => faction.symbolSprite
    );
    const factionLinks = factions
      .map((faction) => ({
        to: `/factions/${faction.type}`,
        label: faction.name,
      }))
      .sort(sortByLabel);

    const skills = getSkills(locale);
    const skillLinks = skills
      .map((skill) => ({
        to: `/skills/${skill.type}`,
        label: getTerm(`Skills/${skill.type}`, locale),
      }))
      .sort(sortByLabel);

    const wielders = getWielders(locale)
      .map((wielder) => ({
        to: `/wielders/${wielder.type}`,
        label: wielder.name,
      }))
      .sort(sortByLabel);

    const units = getUnits(locale)
      .map((unit) => {
        return {
          to: `/units/${unit.faction}/${unit.vanilla.languageKey}`,
          label: unit.vanilla.name,
          description: unit.faction,
        };
      })
      .sort(sortByLabel);

    const artifacts = getArtifacts(locale)
      .map((artifact) => {
        return {
          to: `/artifacts/${artifact.type}`,
          label: artifact.name,
          description: artifact.description,
        };
      })
      .sort(sortByLabel);

    const buildings = getBuildings(locale);
    const buildingLinks = buildings
      .map((building) => ({
        to: `/buildings/${building.type}`,
        label: building.name,
      }))
      .sort(sortByLabel);

    const collectionLinks: CollectionLink[] = [
      {
        label: getSiteTerm("Factions", locale),
        docs: [
          {
            to: "/factions",
            label: getSiteTerm("AllFactions", locale),
          },
          ...factionLinks,
        ],
      },
      {
        label: getSiteTerm("Skills", locale),
        docs: [
          {
            to: "/skills",
            label: getSiteTerm("AllSkills", locale),
          },
          ...skillLinks,
        ],
      },
      {
        label: getSiteTerm("Wielders", locale),
        docs: [
          {
            to: "/wielders",
            label: getSiteTerm("AllWielders", locale),
          },
          ...wielders,
        ],
      },
      {
        label: getSiteTerm("Units", locale),
        docs: [
          {
            to: "/units",
            label: getSiteTerm("AllUnits", locale),
          },
          ...units,
        ],
      },
      {
        label: getSiteTerm("Artifacts", locale),
        docs: [
          {
            to: "/artifacts",
            label: getSiteTerm("AllArtifacts", locale),
          },
          ...artifacts,
        ],
      },
      {
        label: getSiteTerm("Buildings", locale),
        docs: [
          {
            to: "/buildings",
            label: getSiteTerm("AllBuildings", locale),
          },
          ...buildingLinks,
        ],
      },
    ];

    // Terms loaded for every page
    const terms: TermsDTO = {
      DiscordTooltip: getSiteTerm("DiscordTooltip", locale),
      GitHubTooltip: getSiteTerm("GitHubTooltip", locale),
      LearnMore: getSiteTerm("LearnMore", locale),
      Search: getSiteTerm("Search", locale),
    };

    const pagePropsResult = propsResult as {
      props: T;
      revalidate?: number | boolean;
    };

    const result: {
      props: T & {
        collectionLinks: CollectionLink[];
        terms: TermsDTO;
      };
      revalidate?: number | boolean;
    } = {
      props: {
        ...pagePropsResult.props,
        collectionLinks,
        terms: { ...terms, ...(pagePropsResult.props.terms || {}) },
      },
      revalidate: pagePropsResult.revalidate,
    };

    return result;
  };
  return getStaticPropsWithBase;
};
