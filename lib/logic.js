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
  * Namespace for the prototype business model
  */

const namespace = 'care.openhealth.mana';
const factory = getFactory();

/**
 * Sample transaction
 * @param {care.openhealth.mana.CreateAssociation} associationData
 * @transaction
 */
async function createAssociation(associationData) {

    // 1. create the resource Request instance
    let associationId = Date.now().toString(); // TODO: Define ID Definition

    let association = factory.newResource(namespace, 'Association', associationId);
    association.approved = false;
    association.to = associationData.to;
    association.from = associationData.from;

    if (associationData.item) {
        association.item = associationData.item;
    }

    // create concept for message with datetime and message
    let message = factory.newConcept(namespace, "Message");
    message.message = associationData.message;
    message.date = Date.now();

    association.messages.push(message);

    // 2. Add new Association
    let associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    await associationRegistry.add(association);

    // get the users to and from and update Data arrays


    // Emit an event for the creation of an Association aka request
    let event = factory.newEvent('care.openhealth.mana', 'AssociationCreatedEvent');
    event.association = association;
    emit(event);
}

/**
 * Grant existing Association by providing a message or even a link
 * @param {care.openhealth.mana.GrantAssociation} associationData
 * @transaction
 */
async function grantAssociation(associationData) {
    let association;
    
    // 1. Get respective Association
    let associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    let associationExists = await associationRegistry.exists(associationData.association.associationId);
    
    if(associationExists){

        association = await associationRegistry.get(associationData.association.associationId);
        association.approved = true;

         // 2. Create concept Message
        let message = factory.newConcept(namespace, "Message");
        message.message = associationData.message;
        message.date = Date.now();

        // 3. Push message to respective Association
        association.messages.push(message);

        // 4. Update link in Association
        association.link = associationData.link;

        // 5. Update item if it exists

        if(associationData.item){
            association.item = associationData.item;
        }
        
        // 6. Update Association Registry
        associationRegistry.update(association);
    }
   

    // 7. Emit AssociationEvent
    let event = factory.newEvent('care.openhealth.mana', 'AssociationGrantedEvent');
    event.association = associationData;
    emit(event);
}


/**
 * Revoke existing Association by providing a message and removing the link
 * @param {care.openhealth.mana.RevokeAssociation} associationData
 * @transaction
 */
async function revokeAssociation(associationData) {
    let association;
    
    // 1. Get respective Association
    let associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    let associationExists = await associationRegistry.exists(associationData.association.associationId);
    
    if(associationExists){

        association = await associationRegistry.get(associationData.association.associationId);
        association.approved = false;

         // 2. Create concept Message
        let message = factory.newConcept(namespace, "Message");
        message.message = associationData.message;
        message.date = Date.now();

        // 3. Push message to respective Association
        association.messages.push(message);

        // 4. Update link in Association
        association.link = '';

        // 5. Update item if it was removed by owner
        if(!associationData.item){
            association.item = null; // associationData.item;
        }
        
        // 6. Update Association Registry
        associationRegistry.update(association);
    }
   

    // 7. Emit AssociationEvent
    let event = factory.newEvent('care.openhealth.mana', 'AssociationRevokedEvent');
    event.association = associationData;
    emit(event);
}


/**
 * Sample transaction
 * @param {care.openhealth.mana.CreateItem} itemData
 * @transaction
 */
async function createItem(itemData) {

    // 1. create the resource Item instance
    let itemId = Date.now().toString(); // TODO: Define ID Definition

    let item = factory.newResource(namespace, 'Item', itemId);
    item.description = itemData.description;
    item.roles = itemData.roles;
    item.link = itemData.link;
    item.owner = itemData.owner;


    // 2. Add new item
    let itemRegistry = await getAssetRegistry(`${namespace}.Item`);
    await itemRegistry.add(item);


    // Emit an event for the creation of an item aka request
    let event = factory.newEvent('care.openhealth.mana', 'ItemCreatedEvent');
    event.item = item;
    emit(event);
}

/**
 * Sample transaction
 * @param {care.openhealth.mana.RemoveItem} itemData
 * @transaction
 */
async function removeItem(itemData) {

    // 1. Check if item exists

    // 2. Get Item Registry

    // 3. remove item from Item registry 

    // Removing item pointer in associations not necessary as it will simply point to null
    // which is the default value and has an independent link anyway

    // 4. Emit ItemRemovedEvent
    let event = factory.newEvent('care.openhealth.mana', 'ItemRemovedEvent');
    event.date = Date.now();
    event.itemId = itemData.itemId;
    emit(event);
    // need to update Mana web app such that this item is not served anymore


    // 1. create the resource Item instance
    let itemId = Date.now().toString(); // TODO: Define ID Definition

    let item = factory.newResource(namespace, 'Item', itemId);
    item.description = itemData.description;
    item.roles = itemData.roles;
    item.link = itemData.link;
    item.owner = itemData.owner;


    // 2. Add new item
    let itemRegistry = await getAssetRegistry(`${namespace}.Item`);
    await itemRegistry.add(item);


    // Emit an event for the creation of an item aka request
 
}