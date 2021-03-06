import React, { useContext } from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import { Icon } from "react-native-elements";
import { Link, useRouteMatch } from "react-router-dom";

import Modal from "modal-react-native-web";
import { Spacing } from "../../constants/dimension";
import { EthersContext } from "../../context/EthersContext";
import useColors from "../../hooks/useColors";
import DarkModeSwitch from "../DarkModeSwitch";
import FlexView from "../FlexView";
import Text from "../Text";

const MobileWebMenu = ({ expanded, onCollapse }) => {
    const { overlay } = useColors();
    return (
        <Modal animationType="slide" transparent={true} visible={expanded}>
            <TouchableWithoutFeedback style={{ height: "100%" }} onPress={onCollapse}>
                <View
                    style={{
                        height: "100%",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        paddingRight: Spacing.normal,
                        paddingBottom: Spacing.normal,
                        backgroundColor: overlay
                    }}>
                    <FlexView style={{ marginTop: Spacing.small }}>
                        <DarkModeSwitch style={{ marginTop: -2 }} />
                        <CloseButton onPress={onCollapse} />
                    </FlexView>
                    <View style={{ alignItems: "flex-end" }}>
                        <Status />
                        <View style={{ height: Spacing.large }} />
                        <MobileWebMenuItem title={"Swap"} path={"/swap"} />
                        <MobileWebMenuItem title={"Liquidity"} path={"/liquidity"} />
                        <MobileWebMenuItem title={"Migrate"} path={"/migrate"} />
                        {/*<MobileWebMenuItem title={"Farming"} path={"/farming"} />*/}
                        <MobileWebMenuItem title={"Staking"} path={"/staking"} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const CloseButton = ({ onPress }) => {
    const { textDark } = useColors();
    return <Icon type={"material-community"} name={"close"} color={textDark} size={32} onPress={onPress} />;
};

const MobileWebMenuItem = ({ title, path }) => {
    const { textDark, textLight } = useColors();
    const match = useRouteMatch(path);
    const active = match?.path?.startsWith(path);
    return (
        <Link to={path} style={{ textDecoration: "none", marginBottom: Spacing.tiny }}>
            <Text
                style={{
                    fontFamily: "regular",
                    fontSize: 24,
                    color: active ? textDark : textLight
                }}>
                {title}
            </Text>
        </Link>
    );
};

const Status = () => {
    const { textLight, green } = useColors();
    const { chainId, address, ensName } = useContext(EthersContext);
    const connected = chainId === 1 && address;
    const title = connected
        ? ensName || address!.substring(0, 6) + "..." + address!.substring(address!.length - 4, address!.length)
        : "Not connected";
    const color = connected ? green : textLight;
    return (
        <FlexView style={{ marginBottom: Spacing.tiny }}>
            <View style={{ backgroundColor: color, width: 6, height: 6, borderRadius: 3, marginTop: 8 }} />
            <Text style={{ fontSize: 18, color: textLight, marginLeft: 8 }}>{title}</Text>
        </FlexView>
    );
};

export default MobileWebMenu;
