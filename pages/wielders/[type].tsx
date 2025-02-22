import { GetStaticPaths, NextPage } from "next";
import { withStaticBase } from "../../lib/staticProps";

import { Box, Group, Stack, Table, Text, Title } from "@mantine/core";
import SpriteSheet from "../../components/SpriteSheet/SpriteSheet";
import { getWielder, getWielders, WielderDTO } from "../../lib/wielders";
import { getSiteTerm, getTerm, TermsDTO } from "../../lib/terms";
import Head from "next/head";
import PopoverLink from "../../components/PopoverLink/PopoverLink";
import { useTerms } from "../../components/Terms/Terms";
import Lore from "../../components/Lore/Lore";
import WielderStats from "../../components/WielderStats/WielderStats";
import { Fragment } from "react";
import { getWielderStatsIcons, IconsDTO } from "../../lib/icons";

const Wielder: NextPage<{ wielder: WielderDTO; icons: IconsDTO }> = ({
  wielder,
  icons,
}) => {
  const terms = useTerms();

  return (
    <>
      <Head>
        <title>{wielder.name} - SoC.gg</title>
        <meta
          name="description"
          content={`${wielder.description} - ${wielder.name} (Songs of Conquest)`}
        />
      </Head>
      <Stack align="flex-start">
        <Group>
          <SpriteSheet spriteSheet={wielder.portrait} folder="wielders" />
          <Stack spacing="xs">
            <Title order={2}>{wielder.name}</Title>
            <Text>{wielder.faction}</Text>
            <Lore text={wielder.description} />
          </Stack>
        </Group>
        <WielderStats wielder={wielder} icons={icons} />
        <Title order={3}>{terms.startingTroops}</Title>
        <Group>
          {wielder.units.map((unit, index) => (
            <PopoverLink
              key={`${wielder.name}-${unit.name}-${index}`}
              href={`/units/${wielder.faction}/${unit.languageKey}`}
              popover={
                <Stack>
                  <Title order={4}>{unit.name}</Title>
                  <Lore text={unit.description} />
                </Stack>
              }
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateRows: "110px 1fr",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <SpriteSheet spriteSheet={unit.sprite} />
                <Text>
                  <Text
                    sx={(theme) => ({
                      color: theme.colors[theme.primaryColor][5],
                    })}
                    component="span"
                  >
                    {unit.size}
                  </Text>{" "}
                  {unit.name}
                </Text>
              </Box>
            </PopoverLink>
          ))}
        </Group>
        <Title order={3}>{terms.specializations}</Title>
        {wielder.specializations.map((specialization) => (
          <Fragment key={`${wielder.name}-${specialization.bacteriaType}`}>
            {specialization.modifierData.map((modifier) => (
              <Text
                key={modifier.type}
                dangerouslySetInnerHTML={{ __html: modifier.description }}
              />
            ))}
            {specialization.resourcesIncome.map((resourceIncome) => (
              <Text key={resourceIncome.type}>
                {`${terms.production} +${resourceIncome.amount} ${resourceIncome.name}`}
              </Text>
            ))}
          </Fragment>
        ))}
        <Title order={3}>{terms.skills}</Title>
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Required Skills</th>
              <th>Minimum Level</th>
            </tr>
          </thead>
          <tbody>
            {wielder.skills.map((skill) => (
              <tr key={`${wielder.name}-${skill.type}`}>
                <td>
                  <PopoverLink
                    href={`/skills/${skill.type}`}
                    popover={
                      <Stack>
                        <Title order={4}>{skill.name}</Title>
                        <Text size="sm">{skill.lore}</Text>
                      </Stack>
                    }
                  >
                    {skill.name}
                    {skill.level && (
                      <Text>
                        {terms.level} {skill.level}
                      </Text>
                    )}
                  </PopoverLink>
                </td>
                <td>
                  {skill.requiresSkill &&
                    skill.requiredSkills?.map((requiredSkill, index) => (
                      <Fragment key={requiredSkill.type}>
                        {index !== 0 && (
                          <Text
                            component="span"
                            mr="sm"
                            color="dimmed"
                            transform="uppercase"
                            size="xs"
                          >
                            {skill.requirementType === "RequireAll"
                              ? terms.and
                              : terms.or}
                          </Text>
                        )}
                        <PopoverLink
                          href={`/skills/${requiredSkill.type}`}
                          popover={
                            <Stack>
                              <Title order={4}>{requiredSkill.name}</Title>
                              <Text size="sm">{requiredSkill.lore}</Text>
                            </Stack>
                          }
                        >
                          <Text component="span" mr="sm">
                            {requiredSkill.name}
                          </Text>
                        </PopoverLink>
                        {}
                      </Fragment>
                    ))}
                </td>
                <td>{skill.levelRange?.min || 1}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </>
  );
};

export default Wielder;

export const getStaticProps = withStaticBase(async (context) => {
  const type = context.params!.type as string;
  const locale = context.locale!;

  const wielder = getWielder(type, context.locale!);
  if (!wielder) {
    return {
      notFound: true,
    };
  }

  const terms: TermsDTO = {
    offense: getTerm("Commanders/Details/CommanderStat/Offense", locale),
    defense: getTerm("Commanders/Details/CommanderStat/Defense", locale),
    movement: getTerm("Commanders/Details/CommanderStat/Movement", locale),
    viewRadius: getTerm("Commanders/Details/CommanderStat/View", locale),
    command: getTerm("Commanders/Details/CommanderStat/Command", locale),
    startingTroops: getTerm(
      "Adventure/PurchaseWielderMenu/TroopsAtStartHeader",
      locale
    ),
    skills: getTerm("Tutorial/CodexCategory/Skills", locale),
    specializations: getTerm("Commanders/Tooltip/Specializations", locale),
    production: getTerm("Common/Details/GeneratesResources", locale),
    level: getTerm("Common/Stats/Level/Header", locale),
    defenseDescription: getTerm(
      "Commanders/Details/CommanderStat/Description/Defense",
      locale
    ),
    movementDescription: getTerm(
      "Commanders/Details/CommanderStat/Description/Movement",
      locale
    ),
    offenseDescription: getTerm(
      "Commanders/Details/CommanderStat/Description/Offense",
      locale
    ),
    viewDescription: getTerm(
      "Commanders/Details/CommanderStat/Description/View",
      locale
    ),
    commandDescription: getTerm("Skills/Command/Level3/Description", locale),
    and: getSiteTerm("And", locale),
    or: getSiteTerm("Or", locale),
  };

  const icons = getWielderStatsIcons();
  return {
    props: {
      wielder,
      terms,
      icons,
    },
    revalidate: false,
  };
});

export const getStaticPaths: GetStaticPaths = async () => {
  const wielders = getWielders("en").map((wielder) => ({
    params: {
      type: wielder.type,
    },
  }));

  return {
    paths: wielders,
    fallback: "blocking",
  };
};
