/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { SERVER } from "../../index";
import { APICall } from "../../util/CommUtils";
import {Button, Header, SpaceBetween, StatusIndicatorProps} from "@awsui/components-react";
import { ComponentItem } from "../../util/ComponentItem";

interface DetailHeaderProps {
  service: string;
}

interface DetailHeaderState {
  service: ComponentItem;
}
export default class DetailHeader extends Component<
  DetailHeaderProps,
  DetailHeaderState
> {
  state = {
    service: {
      name: "-",
      version: "-",
      status: "New",
      statusIcon: "pending" as StatusIndicatorProps.Type,
      origin: "User",
      canStart: false,
      canStop: false,
    },
  };
  handleServerPush = (component: ComponentItem) => {
    this.setState({ service: component });
  };

  onStartClick = () => {
    SERVER.sendRequest({
      call: APICall.startComponent,
      args: [this.state.service.name],
    });
  };
  onStopClick = () => {
    SERVER.sendRequest({
      call: APICall.stopComponent,
      args: [this.state.service.name],
    });
  };
  onReinstallClick = () => {
    SERVER.sendRequest({
      call: APICall.reinstallComponent,
      args: [this.state.service.name],
    });
  };

  async componentDidUpdate(
    prevProps: Readonly<DetailHeaderProps>,
    prevState: Readonly<DetailHeaderState>,
    snapshot?: any
  ) {
    if (prevProps.service !== this.props.service) {
      // update subscription to currently looked at service
      SERVER.sendSubscriptionMessage(
        { call: APICall.unsubscribeToComponent, args: [prevProps.service] },
        this.handleServerPush
      ).catch((reason) => {
        console.log("Error: " + reason);
      });
      SERVER.sendSubscriptionMessage(
        { call: APICall.subscribeToComponent, args: [this.props.service] },
        this.handleServerPush
      ).catch((reason) => {
        console.log("Error: " + reason);
      });
    }
  }
  async componentDidMount() {
    await SERVER.initConnections();
    SERVER.sendSubscriptionMessage(
      { call: APICall.subscribeToComponent, args: [this.props.service] },
      this.handleServerPush
    ).catch((reason) => {
      console.log("Error: " + reason);
    });
  }
  async componentWillUnmount() {
    SERVER.sendSubscriptionMessage(
      { call: APICall.unsubscribeToComponent, args: [this.props.service] },
      this.handleServerPush
    ).catch((reason) => {
      console.log("Error: " + reason);
    });
  }

  render() {
    return (
      <Header
        actions={
          <SpaceBetween direction={"horizontal"} size={"xs"}>
            <Button
              className="start"
              disabled={!this.state.service.canStart}
              onClick={this.onStartClick}
            >
              Start
            </Button>
            <Button
              className="stop"
              disabled={!this.state.service.canStop}
              onClick={this.onStopClick}
            >
              Stop
            </Button>
            <Button className="reinstall" onClick={this.onReinstallClick}>
              Reinstall
            </Button>
          </SpaceBetween>
        }
      >
        {this.props.service}
      </Header>
    );
  }
}
