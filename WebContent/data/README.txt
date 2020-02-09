PROJ-PROJ: Project Database
LAB-LAB: Lab Database
KIND-KIND: Inventory Type Database (e.g. Mech Tools, 3D Printers, etc)
ITEM-ITEM: Item Details Database
SOURCE-SOURCE: Item Source Database (1 Item can have Multiple Source)

/* Perishables and Equipment are SPLIT */

STOCK-STOCK: PERISHABLES' Stock Database
EQUIP-EQUIP: EQUIPMENT'S Stock and Status Database
	Stat
	- 1 = Available
	- 2 = Out of Order
	- 3 = Running
	- 4 = Pending Delivery
	- 5 = Pending Approval
STATUS-STATUS: EQUIPMENT'S Status Map
TRANS-TRANS: PERISHABLES' Transaction History Database
	Stat
	- 1 = added to stock/delivered
	- 2 = pending delivery/completion
	- 3 = pending approval
HIST-HIST: EQUIPMENT'S Log Database
	Stat
	- 1 = Available
	- 2 = Out of Order
	- 3 = Running
	- 4 = Pending Delivery
	- 5 = Pending Approval
