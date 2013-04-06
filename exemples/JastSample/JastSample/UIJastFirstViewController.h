//
//  UIJastFirstViewController.h
//  JastSample
//
//  Created by adelskott on 23/03/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SocketIO.h"

@interface UIJastFirstViewController : UIViewController<SocketIODelegate,UITableViewDataSource,UITableViewDelegate>{
    SocketIO *socketIO;
    NSArray *list;
    BOOL run;
    
    IBOutlet UITableView *tb_view;
    
}

@end
