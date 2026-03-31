import { BoxProps, HStack, Link, Text } from "@chakra-ui/react";
import { REPO_URL } from "constants/Project";
import { useDashboard } from "contexts/DashboardContext";
import { FC } from "react";

export const Footer: FC<BoxProps> = (props) => {
  const { version } = useDashboard();
  return (
    <HStack w="full" py="0" position="relative" {...props}>
      <Text
        display="inline-block"
        flexGrow={1}
        textAlign="center"
        color="gray.400"
        fontSize="xs"
      >
        <Link color="primary.400" href={REPO_URL} isExternal>
          Marzban
        </Link>
        {version ? ` v${version}` : ""}
        {" · "}
        Powered by{" "}
        <Link color="primary.400" href="https://github.com/Gozargah" isExternal>
          Gozargah
        </Link>
      </Text>
    </HStack>
  );
};
