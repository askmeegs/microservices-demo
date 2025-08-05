// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const charge = require('./charge');

const logger = require('./logger')

/**
 * A gRPC server that implements the PaymentService and HealthCheck services.
 */
class HipsterShopServer {
  /**
   * @param {string} protoRoot - The path to the root directory of the protobuf definitions.
   * @param {number} [port=HipsterShopServer.PORT] - The port to listen on.
   */
  constructor(protoRoot, port = HipsterShopServer.PORT) {
    this.port = port;

    this.packages = {
      hipsterShop: this.loadProto(path.join(protoRoot, 'demo.proto')),
      health: this.loadProto(path.join(protoRoot, 'grpc/health/v1/health.proto'))
    };

    this.server = new grpc.Server();
    this.loadAllProtos(protoRoot);
  }

  /**
   * Handler for PaymentService.Charge.
   * @param {object} call - The gRPC call object.
   * @param {object} call.request - The charge request.
   * @param {function} callback - The callback function.
   */
  static ChargeServiceHandler(call, callback) {
    try {
      logger.info(`PaymentService#Charge invoked with request ${JSON.stringify(call.request)}`);
      const response = charge(call.request);
      callback(null, response);
    } catch (err) {
      console.warn(err);
      callback(err);
    }
  }

  /**
   * Handler for Health.Check.
   * @param {object} call - The gRPC call object.
   * @param {function} callback - The callback function.
   */
  static CheckHandler(call, callback) {
    callback(null, { status: 'SERVING' });
  }

  /**
   * Starts the gRPC server.
   */
  listen() {
    const server = this.server
    const port = this.port
    server.bindAsync(
      `[::]:${port}`,
      grpc.ServerCredentials.createInsecure(),
      function () {
        logger.info(`PaymentService gRPC server started on port ${port}`);
        server.start();
      }
    );
  }

  /**
   * Loads a protobuf file.
   * @param {string} path - The path to the protobuf file.
   * @returns {object} - The loaded package definition.
   */
  loadProto(path) {
    const packageDefinition = protoLoader.loadSync(
      path,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );
    return grpc.loadPackageDefinition(packageDefinition);
  }

  /**
   * Loads all protobuf services.
   */
  loadAllProtos() {
    const hipsterShopPackage = this.packages.hipsterShop.hipstershop;
    const healthPackage = this.packages.health.grpc.health.v1;

    this.server.addService(
      hipsterShopPackage.PaymentService.service,
      {
        charge: HipsterShopServer.ChargeServiceHandler.bind(this)
      }
    );

    this.server.addService(
      healthPackage.Health.service,
      {
        check: HipsterShopServer.CheckHandler.bind(this)
      }
    );
  }
}

HipsterShopServer.PORT = process.env.PORT;

module.exports = HipsterShopServer;