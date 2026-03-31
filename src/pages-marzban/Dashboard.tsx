import { Box, VStack } from "@chakra-ui/react";
import { CoreSettingsModal } from "components/CoreSettingsModal";
import { DeleteUserModal } from "components/DeleteUserModal";
import { Filters } from "components/Filters";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { HostsDialog } from "components/HostsDialog";
import { NodesDialog } from "components/NodesModal";
import { NodesUsage } from "components/NodesUsage";
import { QRCodeDialog } from "components/QRCodeDialog";
import { ResetAllUsageModal } from "components/ResetAllUsageModal";
import { ResetUserUsageModal } from "components/ResetUserUsageModal";
import { RevokeSubscriptionModal } from "components/RevokeSubscriptionModal";
import { Statistics } from "components/Statistics";
import { UserDialog } from "components/UserDialog";
import { UsersTable } from "components/UsersTable";
import { AdminManagerModal } from "components/AdminManagerModal";
import { AdminLimitsModal } from "components/AdminLimitsModal";
import { HappCryptoModal } from "components/HappCryptoModal";
import { fetchInbounds, useDashboard } from "contexts/DashboardContext";
import { FC, useEffect, useState } from "react";

export const Dashboard: FC = () => {
  const [adminManagerOpen, setAdminManagerOpen] = useState(false);
  const [adminLimitsOpen, setAdminLimitsOpen] = useState(false);
  const [happCryptoOpen, setHappCryptoOpen] = useState(false);

  useEffect(() => {
    useDashboard.getState().refetchUsers();
    fetchInbounds();
  }, []);

  return (
    <VStack justifyContent="space-between" minH="100vh" rowGap={0}>
      <Box w="full">
        <Header
          onAdminManager={() => setAdminManagerOpen(true)}
          onAdminLimits={() => setAdminLimitsOpen(true)}
          onHappCrypto={() => setHappCryptoOpen(true)}
        />
        <Box px="6" pt={4}>
          <Statistics mb={4} />
          <Filters />
          <UsersTable />
        </Box>
      </Box>

      <Box w="full" px="6" pb={4}>
        <Footer />
      </Box>

      {/* Original Marzban modals — all preserved */}
      <UserDialog />
      <DeleteUserModal />
      <QRCodeDialog />
      <HostsDialog />
      <ResetUserUsageModal />
      <RevokeSubscriptionModal />
      <NodesDialog />
      <NodesUsage />
      <ResetAllUsageModal />
      <CoreSettingsModal />

      {/* New modals */}
      <AdminManagerModal
        isOpen={adminManagerOpen}
        onClose={() => setAdminManagerOpen(false)}
      />
      <AdminLimitsModal
        isOpen={adminLimitsOpen}
        onClose={() => setAdminLimitsOpen(false)}
      />
      <HappCryptoModal
        isOpen={happCryptoOpen}
        onClose={() => setHappCryptoOpen(false)}
      />
    </VStack>
  );
};

export default Dashboard;
