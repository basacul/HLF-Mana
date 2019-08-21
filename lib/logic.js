/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Sample transaction
 * @param {care.openhealth.mana.CreateRequest} requestData
 * @transaction
 */
async function createRequest(requestData) {

    // 1. get resource factory
    let factory = getFactory();
    const namespace = 'care.openhealth.mana';

    // 2. create the resource Request instance
    let requestId = Date.now().toString(); // TODO: Define ID Definition

    let request = factory.newResource(namespace, 'Request', requestId);
    request.owner = requestData.owner;
    request.requester = requestData.requester;
    request.message = requestData.message;

    // 3. Add new request
    let requestRegistry = await getAssetRegistry(`${namespace}.Request`);
    await requestRegistry.add(request);

    // Emit an event for the modified asset.
    let event = getFactory().newEvent('care.openhealth.mana', 'RequestEvent');
    event.request = request;
    event.approved = false;
    emit(event);
}