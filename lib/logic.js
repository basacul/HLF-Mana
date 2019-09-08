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
    let associationId = associationData.associationId; // TODO: Define ID Definition

    let association = factory.newResource(namespace, 'Association', associationId);
    association.approved = false;
    association.to = associationData.to;
    association.from = associationData.from;

    if (associationData.item) {
        association.item = associationData.item;
    }

    // create concept for message with datetime and message
    let message = factory.newConcept(namespace, "Message");
    message.from = associationData.from.split('#')[1];
    message.message = associationData.message;
    message.date = new Date(Date.now());
    // initialize messages array before pushing anything. Otherwise messages not defined
    association.messages = [];
    association.messages.push(message);

    // 2. Add new Association
    let associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    await associationRegistry.add(association);

    // get the users to and from and update Data arrays


    // Emit an event for the creation of an Association aka request
    let event = factory.newEvent(namespace, 'AssociationCreatedEvent');
    event.associationId = association.associationId;
    emit(event);
}

/**
 * Grant existing Association by providing a message or even a link
 * @param {care.openhealth.mana.UpdateAssociation} associationData
 * @transaction
 */
async function updateAssociation(associationData) {
    let association;

    // 1. Get respective Association
    let associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    let associationExists = await associationRegistry.exists(associationData.association.associationId);

    if (associationExists) {

        association = await associationRegistry.get(associationData.association.associationId);

        // 2. Create concept Message
        let message = factory.newConcept(namespace, "Message");
        message.from = associationData.from;
        message.message = associationData.message;
        message.date = new Date(Date.now());

        // 3. Unshift message to respective Association
        association.messages.unshift(message);

        // 4. Update item if it exists
        if (associationData.item) {
            association.item = associationData.item;
        }

        // 5. Update link if it exists
        if (associationData.link) {
            association.link = associationData.link
        }

        // 6. Update Association Registry
        associationRegistry.update(association);

        // 7. Emit AssociationUpdatedEvent
        let event = factory.newEvent(namespace, 'AssociationUpdatedEvent');
        event.associationId = association.associationId;
        emit(event);
    } else {
        // Do nothing yet
    }
}

/**
 * Remove existing Association 
 * @param {care.openhealth.mana.DeleteAssociation} associationData
 * @transaction
 */
async function deleteAssociation(associationData) {
    let deletedAssociationId;

    // 1. Get Association in Registry
    let associationRegistry;
    try {
        associationRegistry = await getAssetRegistry(`${namespace}.Association`);
    } catch (error) {
        // TODO: Error handling
    }

    // 2. Check if association exists
    let associationExists;
    try {
        associationExists = await associationRegistry.exists(associationData.association.associationId);
    } catch (error) {
        associationExists = false;
    }

    if (associationExists) {
        deletedAssociationId = associationData.association.associationId;

        // 3. remove association from Association registry
        try {
            await associationRegistry.remove(associationData.association);
        } catch (error) {
            // TODO: Error handling
        }
    }

    // Removing association pointer has no effect as the remaining item will 
    // be used somewhere else otherwise owner needs to remove item in a separate step

    // 4. Emit AssociationDeletedEvent
    let event = factory.newEvent(namespace, 'AssociationDeletedEvent');
    event.associationId = deletedAssociationId;
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

    if (associationExists) {

        association = await associationRegistry.get(associationData.association.associationId);
        association.approved = true;

        // 2. Create concept Message
        let message = factory.newConcept(namespace, "Message");
        message.from = associationData.from;
        message.message = associationData.message;
        message.date = new Date(Date.now());

        // 3. Unshift message to respective Association
        association.messages.unshift(message);

        // 4. Update link in Association
        association.link = associationData.link;

        // 5. Update item if it exists

        if (associationData.item) {
            association.item = associationData.item;
        }

        // 6. Update Association Registry
        associationRegistry.update(association);
    }


    // 7. Emit AssociationEvent
    let event = factory.newEvent(namespace, 'AssociationGrantedEvent');
    event.associationId = association.associationId;
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

    if (associationExists) {

        association = await associationRegistry.get(associationData.association.associationId);
        association.approved = false;

        // 2. Create concept Message
        let message = factory.newConcept(namespace, "Message");
        message.from = associationData.from;
        message.message = associationData.message;
        message.date = new Date(Date.now());

        // 3. Unshift message to respective Association
        association.messages.unshift(message);

        // 4. Update link in Association
        association.link = '';

        // 5. Update item if it was removed by owner
        if (!associationData.item) {
            association.item = null; // associationData.item;
        }

        // 6. Update Association Registry
        associationRegistry.update(association);
    }


    // 7. Emit AssociationEvent
    let event = factory.newEvent(namespace, 'AssociationRevokedEvent');
    event.associationId = association.associationId;
    emit(event);
}


/**
 * Sample transaction
 * @param {care.openhealth.mana.CreateItem} itemData
 * @transaction
 */
async function createItem(itemData) {

    // 1. create the resource Item instance
    let itemId = itemData.itemId; // TODO: Define ID Definition

    let item = factory.newResource(namespace, 'Item', itemId);
    item.description = itemData.description;
    item.role = itemData.role;
    item.link = itemData.link;
    item.owner = itemData.owner;


    // 2. Add new item
    let itemRegistry = await getAssetRegistry(`${namespace}.Item`);
    await itemRegistry.add(item);


    // Emit an event for the creation of an item aka request
    let event = factory.newEvent(namespace, 'ItemCreatedEvent');
    event.itemId = item.itemId;
    emit(event);
}

/**
 * Update existing Item
 * @param {care.openhealth.mana.UpdateItem} itemData
 * @transaction
 */
async function updateItem(itemData) {
    let item;

    // 1. Get respective Item
    let itemRegistry = await getAssetRegistry(`${namespace}.Item`);
    let itemExists = await itemRegistry.exists(itemData.item.itemId);

    if (itemExists) {

        item = await itemRegistry.get(itemData.item.itemId);

        // 2. Update description if not empty
        if (itemData.description) {
            item.description = itemData.description;
        }

        // 3. Update role if not empty
        if (itemData.role) {
            item.role = itemData.role;
        }

        // 4. Update link if not empty
        if (itemData.link) {
            item.link = itemData.link;
        }

        // 5. Update owner if not empty
        if (itemData.owner) {
            item.owner = itemData.owner;
        }

        itemRegistry.update(item);

        // 7. Emit an event for the creation of an item aka request
        let event = factory.newEvent(namespace, 'ItemUpdatedEvent');
        event.itemId = item.itemId;
        emit(event);
    } else {
        // Do nothing yet
    }
}

/**
 * Sample transaction
 * @param {care.openhealth.mana.DeleteItem} itemData
 * @transaction
 */
async function deleteItem(itemData) {
    let deletedItemId;

    // 1. Get Item Registry
    let itemRegistry;
    try {
        itemRegistry = await getAssetRegistry(`${namespace}.Item`);
    } catch (error) {
        // TODO: Error handling
    }



    // 2. Check if item exists
    let itemExists;
    try {
        itemExists = await itemRegistry.exists(itemData.item.itemId);
    } catch (error) {
        itemExists = false;
    }


    if (itemExists) {
        deletedItemId = itemData.item.itemId;

        // 3. remove item from Item registry 
        try {
            await itemRegistry.remove(itemData.item);
        } catch (error) {
            // TODO: Error handling
        }

    }

    // Removing item pointer in associations not necessary as it will simply point to null
    // which is the default value and has an independent link anyway

    // 4. Emit ItemDeletedEvent
    let event = factory.newEvent(namespace, 'ItemDeletedEvent');
    event.itemId = deletedItemId;
    emit(event);
    // need to update Mana web app such that this item is not served anymore 
}