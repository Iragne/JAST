//
//  UIJastViewController.h
//  JastChatSample
//
//  Created by adelskott on 01/04/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import <UIKit/UIKit.h>


@interface UIJastViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>{
    NSArray *list;
}
@property (strong,nonatomic) IBOutlet UITextField *tf_login;

@property (weak,nonatomic) IBOutlet UIView *v_login;

@property (weak, nonatomic) IBOutlet UITableView *tb_list;
@end
